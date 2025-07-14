const { ExecutionModel, JobModel} = require('../models');
const { sequelize } = require('../config/connection');
const { Op } = require('sequelize');
const jobDao = require('./job.dao');

const createExecutions = async () => {
    const t = await sequelize.transaction();
    try {
        const currentTime = new Date();
        // 1. Lock due jobs (SKIP LOCKED prevents blocking)
        const dueJobs = await JobModel.findAll({
            where: {
                status: {
                    [Op.in]: ['pending', 'running']
                },
                next_run_at: { [Op.eq]: currentTime }
            },
            order: [['id', 'ASC']],
            limit: 50,
            lock: true,  // Enables row locking
            skipLocked: true,  // Skip already-locked rows
            transaction: t,
        });
        
        if (dueJobs.length === 0) {
            await t.commit();
            console.log(`No due jobs found at ${currentTime}`);
            return null;
        }

        // 2. Create executions for locked jobs
        const executions = await ExecutionModel.bulkCreate(
            dueJobs.map(job => ({
                job_id: job.id,
                scheduled_at: job.next_run_at,
            })),
            { transaction: t }
        );

        // 3. Update next_run_at for recurring jobs
        await Promise.all(
            dueJobs.map(job => {
                return jobDao.updateJobStatus(job.id, { status: 'running' }, { transaction: t });
                /* const interval = CronExpressionParser.parse(job.schedule_expression);
                const nextRun = interval.next().toDate();
                return job.update(
                    { next_run_at: nextRun }, 
                    { transaction: t }
                ); */
            })
        );
        await t.commit();
        return executions;
    } catch (error) {
        await t.rollback();
        console.error("Error creating execution:", error);
        throw error;
    }
}

const getDueExecutions = async () => {
    const t = await sequelize.transaction();
    try {
        const currentTime = new Date();
        const dueExecutions = await ExecutionModel.findAll({
            where: {
                status: {
                    [Op.or]: ['pending']
                },
                scheduled_at: {
                    [Op.lte]: currentTime
                }
            },
            include: [{
                model: JobModel,
                as: 'job',
                attributes: ['id', 'identifier', 'version', 'title']
            }],
            attributes: ['id', 'job_id', 'scheduled_at'],
            order: [['scheduled_at', 'ASC']],
            limit: 50,
            lock: true,  // Enables row locking
            skipLocked: true,  // Skip already-locked rows
            transaction: t,
        });
        if (dueExecutions.length === 0) {
            await t.commit();
            return null;
        }

        // update status to 'in_queue' for due executions
        const executionIds = dueExecutions.map(execution => execution.id);
        await ExecutionModel.update(
            { status: 'in_queue' },
            {
                where: {
                    id: {
                        [Op.in]: executionIds
                    }
                },
                transaction: t
            }
        );

        await t.commit();
        return dueExecutions;
    } catch (error) {
        await t.rollback();
        console.error("Error fetching due executions:", error);
        throw error;
    }
}

const getExecutionById = async (id) => {
    try {
        const execution = await ExecutionModel.findByPk(id);

        if (!execution) {
            const error = new Error("Execution not found");
            error.status = 404;
            throw error;
        }
        const job = await jobDao.getJobById(execution.job_id);
        execution.job = job;
        return execution;
    } catch (error) {
        console.error(`Error fetching execution with id ${id}:`, error);
        throw error;
    }
};

const updateExecutionAfterRun = async (id, data) => {
    try {
        const execution = await ExecutionModel.findByPk(id);
        if (!execution) {
            const error = new Error("Execution not found");
            error.status = 404;
            throw error;
        }
        data.completed_at = new Date();

        await execution.update(data);

        let jobUpdateData = { last_run_at: execution.started_at };
        if(data.status === "failed"){
            jobUpdateData.status = "retry";
        }
        
        await await jobDao.updateJob(execution.job_id, jobUpdateData);
        return execution;
    } catch (error) {
        console.error(`Error updating execution with id ${id}:`, error);
        throw error;
    }
}

const performRetry = async (executionId) => {
    const t = await sequelize.transaction();
    try {
        const execution = await getExecutionById(executionId);
        // const needRetry = execution && execution.job && execution.status === 'failed' && execution.try_count <= execution.job.max_retries;
        // REMOVED execution status check because status update is done by another service so possible that call is in progress
        const needRetry = execution && execution.job && execution.try_count <= execution.job.max_retries;
        if (!needRetry) {
            const error = new Error(`Max retries reached for execution #${execution.job.identifier} v-${execution.job.version}.`);
            error.status = 400;
            throw error;
        }

        console.log(`Retrying execution ${executionId}, attempt ${execution.try_count + 1}`);

        const currentTime = new Date();
        let retryScheduledAt = currentTime;
        if(execution.job.retry_strategy == "exponential") {
            const retryDelay = Math.pow(2, execution.try_count - 1) * 1000; // Exponential backoff
            retryScheduledAt = new Date(currentTime.getTime() + retryDelay);
        }
        else if(execution.job.retry_strategy == "linear") {
            const retryDelay = execution.try_count * 1000; // Linear backoff
            retryScheduledAt = new Date(currentTime.getTime() + retryDelay);
        }

        const retryExecution = await ExecutionModel.create({
            job_id: execution.job_id,
            scheduled_at: retryScheduledAt,
            try_count: execution.try_count + 1
        }, { transaction: t });

        await execution.job.update(
            { next_run_at: retryScheduledAt, status: "running" }, 
            { transaction: t }
        );

        await t.commit();
        return retryExecution;
    } catch (error) {
        await t.rollback();
        console.error("Error creating execution:", error);
        throw error;
    }
}

const getExecutionHistory = async (jobId, page = 1, pageSize = 10) => {
    try {
        const offset = (page - 1) * pageSize;
        const { rows: executions, count: total } = await ExecutionModel.findAndCountAll({
            where: {
                job_id: {
                    [Op.eq]: Number(jobId)
                }
            },
            limit: Number(pageSize),
            offset,
            order: [['scheduled_at', 'DESC']]
        });

        const pages = Math.ceil(total/pageSize);
        return { executions, total: pages };
    } catch (error) {
        console.error("Error fetching execution history:", error);
        throw error;
    }
}

module.exports = {
    createExecutions,
    getDueExecutions,
    getExecutionById,
    updateExecutionAfterRun,
    performRetry,
    getExecutionHistory
};