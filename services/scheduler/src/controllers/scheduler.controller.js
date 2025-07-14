const ExecutionDao = require('@shared/mysql/daos/execution.dao');
const { sendMessage } = require('@shared/kafka/src/producer');
const kafkaConstants = require('@shared/kafka/src/constants');
const { preparePayload } = require('@shared/kafka/src/helpers/monitoring_queue.helper');

const startScheduling = async () => {
    try {
        const dueExecutions = await ExecutionDao.getDueExecutions();
        if(!dueExecutions || dueExecutions.length === 0) {
            // const currentTime = new Date();
            // console.log(`No due executions found at ${currentTime}`);
            return;
        }
        const scheduledJobsData = dueExecutions.map(execution => ({
            key: execution.job_id.toString(),
            value: JSON.stringify({
                id: execution.id.toString(),
                job_id: execution.job_id.toString(),
                scheduled_at: execution.scheduled_at.toString(),
            }),
        }));
        await sendMessage({
            topic: kafkaConstants.topics.scheduled,
            messages: scheduledJobsData,
        });

        const monitorData = dueExecutions.map(execution => preparePayload({
            message: `[Scheduler Service] Queuing job #${execution.job.identifier}-${execution.job.version} '${execution.job.title}' to run at ${execution.scheduled_at}`, 
            jobId: execution.job_id,
            jobTitle: execution.job.title,
            executionId: execution.id
        }));
        await sendMessage({
            topic: kafkaConstants.topics.monitor,
            messages: monitorData,
        });
    } catch (error) {
        console.error("Error fetching due executions:", error);
    }
}

module.exports = {
    startScheduling
};