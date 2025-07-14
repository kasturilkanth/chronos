const ExecutionDao = require('@shared/mysql/daos/execution.dao');
const { sendMessage } = require('@shared/kafka/src/producer');
const monitorQueueHelper = require('@shared/kafka/src/helpers/monitoring_queue.helper');
const kafkaConstants = require('@shared/kafka/src/constants');
const consumer = require('../consumer');
const executors = require('../utils/job_executor');

const fetchAndExecute = async () => {
    try {
        await consumer.subscribe({ topic: 'scheduled-jobs', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value.toString();
                // console.log(`[WORKER SERVICE] Received: ${value}`);
                const payload = JSON.parse(value);
                performJobExecution(payload)
            },
        });

    } catch (error) {
        console.error("Worker service error:", error);
    }
}

const performJobExecution = async (payload) => {
    const executionId = payload.id;
    const jobId = payload.job_id;
    try {
        // console.log(`[WORKER SERVICE] Executing job with payload: ${JSON.stringify(payload)}`);

        const execution = await ExecutionDao.getExecutionById(executionId);
        console.log(execution);
        if (!execution) {
            throw new Error(`Execution with ID ${executionId} not found.`);
        }
        if (!execution.job) {
            throw new Error(`Job with Execution ID ${executionId} not found.`);
        }
        if (execution.job.status === 'paused' || execution.job.status === 'completed' || execution.job.status === 'failed') {
            throw new Error(`Job is either paused or failed.`);
        }
        execution.started_at = new Date();
        await execution.save();
        
        await sendMessage({
            topic: kafkaConstants.topics.monitor,
            messages: [
                monitorQueueHelper.preparePayload({
                    message: `[Worker Service] Starting job #${execution.job.identifier}-${execution.job.version} '${execution.job.title}' at ${execution.scheduled_at}`, 
                    jobId: execution.job_id,
                    jobTitle: execution.job.title,
                    executionId: execution.id
                })
            ],
        });

       let output;
       const job = execution.job;
       const command = job.command;
       const commandPayload = JSON.parse(job.payload);
       switch (job.type) {
            case 'shell':
                output = await executors.executeShellJob(command, commandPayload);
                break;
            case 'email':
                output = await executors.executeEmailJob(command, commandPayload);
                break;
            case 'http':
                output = await executors.executeHttpJob(command, commandPayload);
                break;
            default:
                throw new Error('Unknown job type');
        }
        console.log(`Job ${payload.id} executed successfully.`);
        await sendMessage({
            topic: kafkaConstants.topics.success,
            messages: [
                {
                    key: payload.id.toString(),
                    value: JSON.stringify({
                        id: payload.id.toString(),
                        job_id: jobId.toString(),
                        status: 'success',
                        output: output,
                    }),
                }
            ],
        });
        
        await sendMessage({
            topic: kafkaConstants.topics.monitor,
            messages: [
                monitorQueueHelper.preparePayload({
                    message: `[Worker Service] Job #${execution.job.identifier}-${execution.job.version} '${execution.job.title}' successfully executed at ${execution.scheduled_at}`, 
                    type: "success",
                    jobId: execution.job_id,
                    jobTitle: execution.job.title,
                    executionId: execution.id
                })
            ],
        });
    } catch (error) {
        await sendMessage({
            topic: kafkaConstants.topics.error,
            messages: [
                {
                    key: payload.id.toString(),
                    value: JSON.stringify({
                        id: executionId,
                        job_id: jobId,
                        code: error.code || 'JOB_EXECUTION_ERROR',
                        error: error.message,
                    }),
                }
            ],
        });
        let message = `[Worker Service] ${error.message}`;
        if(error.jobDetails){
            message = `[Worker Service] Job #${error.jobDetails.identifier}-${error.jobDetails.version} '${error.jobDetails.title}' execution failed at ${error.jobDetails.scheduled_at}`;
        }
        console.log(`[WORKER SERVICE] Error : ${message}`);
        await sendMessage({
            topic: kafkaConstants.topics.monitor,
            messages: [
                monitorQueueHelper.preparePayload({
                    message: message, 
                    type: "error",
                    jobId: jobId,
                    jobTitle: error.jobDetails ? error.jobDetails.title : 'unknown',
                    executionId: executionId
                })
            ],
        });
        console.error(`Error executing job ${jobId}:`, error);
    }
};

module.exports = {
    fetchAndExecute
};