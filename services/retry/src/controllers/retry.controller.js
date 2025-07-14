const ExecutionDao = require('@shared/mysql/daos/execution.dao');
const JobDao = require('@shared/mysql/daos/job.dao');
const kafkaConstants = require('@shared/kafka/src/constants');
const consumer = require('../consumer');

const decideAndExecuteRetry = async () => {
    try {
        await consumer.subscribe({ topic: kafkaConstants.topics.error, fromBeginning: true });
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value.toString();
                console.log(`[RETRY SERVICE] Received: ${value}`);
                const payload = JSON.parse(value);
                await performRetry(payload);
            },
        });
    }
    catch (error) {
        console.error("Retry service error:", error);
    }
} 

const performRetry = async (payload) => {
    const executionId = payload.id;
    const jobId = payload.job_id;
    try {
        await ExecutionDao.performRetry(executionId);
    } catch (error) {
        console.error("Error during retry:", error);
        if(error.status ===400){
            await JobDao.updateJobStatus(jobId, {status: 'failed'});
        }
    }
}

module.exports = {
    decideAndExecuteRetry,
};