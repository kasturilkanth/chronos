const { JobModel } = require('../models');
const { sequelize } = require('../config/connection');
const { CronExpressionParser } = require('cron-parser');
const { Op } = require('sequelize');
const redisClient = require('@shared/redis')

const createJob = async (jobData) => {
    try {
        const { title, description, type, schedule_expression, command, payload, retry_strategy, max_retries } = jobData;
        const identifier = `job-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const interval = CronExpressionParser.parse(schedule_expression);

        const newJob = await JobModel.create({
            identifier,
            title,
            description,
            type,
            schedule_expression,
            command,
            payload,
            retry_strategy,
            max_retries,
            next_run_at: interval.next().toDate(),
        });

        return newJob;
    } catch (error) {
        console.error("Error creating job:", error);
        throw error;
    }
};

const getAllJobs = async () => {
    try {
        const jobs = await JobModel.findAll();
        return jobs;
    } catch (error) {
        console.error("Error fetching all jobs:", error);
        throw error;
    }
};

const getJobById = async (id) => {
    try {
        let job = await redisClient.get(`job:${id}`);
        if(job){
            job = JSON.parse(job);
            // Reconstruct Sequelize model instance from JSON data
            job = JobModel.build(job, { isNewRecord: false });
        }
        if(!job){
            job = await JobModel.findByPk(id);
            if(job){
                let jobJson = job.toJSON();
                await redisClient.set(`job:${id}`, JSON.stringify(jobJson), 'EX', 300);
            }
        }
        
        if (!job) {
            const error = new Error("Job not found");
            error.status = 404;
            throw error;
        }
        return job;
    } catch (error) {
        console.error(`Error fetching job with id ${id}:`, error);
        throw error;
    }
};

const getDueJobs = async () => {
    try {
        const currentTime = new Date();
        const dueJobs = await JobModel.findAll({
            where: {
                status: {
                    [Op.or]: ['pending', 'running']
                },
                next_run_at: {
                    [Op.eq]: currentTime
                }
            }
        });
        return dueJobs;
    } catch (error) {
        console.error("Error fetching due jobs:", error);
        throw error;
    }
}

const updateJob = async (id, jobData) => {
    const t = await sequelize.transaction();
    try {
        const job = await getJobById(id);
        const { title, description, type, schedule_expression, command, payload, retry_strategy, max_retries, status, last_run_at } = jobData;

        let updatedJob;
        if(type &&
            schedule_expression &&
            command &&
            payload &&
            (type !== job.type ||
                schedule_expression !== job.schedule_expression ||
                command !== job.command ||
                payload !== job.payload)
            ) {
            const interval = CronExpressionParser.parse(schedule_expression);
            updatedJob = await JobModel.create({
                title,
                identifier: job.identifier,
                description,
                type,
                schedule_expression,
                command,
                payload,
                retry_strategy,
                max_retries,
                next_run_at: interval.next().toDate(),
                version: job.version + 1,
            });
            await removeJob(id);
        }
        else{
            if (title) job.title = title;
            if (description) job.description = description;
            if (retry_strategy) job.retry_strategy = retry_strategy;
            if (max_retries) job.max_retries = max_retries;
            if (status) job.status = status;
            if (last_run_at) job.last_run_at = last_run_at;

            await job.save();
            updatedJob = job;
        }
        await t.commit();
        let jobJson = job.toJSON();
        await redisClient.set(`job:${id}`, JSON.stringify(jobJson), 'EX', 300);

        return updatedJob;
    } catch (error) {
        await t.rollback();
        console.error(`Error updating job with id ${id}:`, error);
        throw error;
    }
};

const updateJobStatus = async (id, jobData, options = {}) => {
    const transaction = options.transaction || null;
    try {
        const job = await getJobById(id);
        const { status } = jobData;
        job.status = status;

        if(status == "running"){
            const interval = CronExpressionParser.parse(job.schedule_expression);
            job.next_run_at = interval.next().toDate();
        }
        else if(status == "completed" || status == "paused"){
            job.next_run_at = null;
        }

        await job.save(transaction ? { transaction } : undefined);
        let jobJson = job.toJSON();
        await redisClient.set(`job:${id}`, JSON.stringify(jobJson), 'EX', 300);
        return job;
    } catch (error) {
        console.error(`Error updating job with id ${id}:`, error);
        throw error;
    }
};

const removeJob = async (id) => {
    try {
        const job = await getJobById(id);
        await job.destroy();
        await redisClient.del(`job:${id}`);
        return job;
    } catch (error) {
        console.error(`Error deleting job with id ${id}:`, error);
        throw error;
    }
};

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    getDueJobs,
    updateJob,
    updateJobStatus,
    removeJob
};