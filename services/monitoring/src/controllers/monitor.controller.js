const ExecutionDao = require('@shared/mysql/daos/execution.dao');
const monitorQueueHelper = require('@shared/kafka/src/helpers/monitoring_queue.helper');
const consumer = require('../consumer');
const kafkaConstants = require('@shared/kafka/src/constants');
const SSE = require('express-sse');

const sse = new SSE();
const jobClients = {};

const monitorStream = (req, res) => {
    const jobId = req.query.jobId || req.params.jobId;
    sse.init(req, res);
    console.log("[MONITORING SSE SERVICE] Client connected for monitoring stream");
    if (!jobClients[jobId]) jobClients[jobId] = [];
    jobClients[jobId].push(res);
    req.on('close', () => {
        jobClients[jobId] = jobClients[jobId].filter(r => r !== res);
        if (jobClients[jobId].length === 0) delete jobClients[jobId];
        console.log(`[MONITORING SSE SERVICE] Client disconnected for job_id=${jobId}`);
    });
    const welcomeMessage = {
        type: 'default',
        message: 'Connection established. Waiting for job updates...'
    };
    res.write(`data: ${JSON.stringify(welcomeMessage)}\n\n`);
};

const startListening = async () => {
    try {
        // const jobId = req.params.jobId;

        consumer.on('consumer.crash', (event) => {
            console.error('Consumer crashed:', event.payload.error);
        });

        consumer.on('consumer.disconnect', (event) => {
            console.error('Consumer disconnected:', event.payload.error);
        });
        
        await consumer.subscribe({ topics: [
            kafkaConstants.topics.monitor,
            kafkaConstants.topics.success,
            kafkaConstants.topics.error
        ], fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`Received message from topic: ${topic}, partition: ${partition}`);
                console.log(`Message: ${message.value.toString()}`);
                if (topic === kafkaConstants.topics.monitor) {
                    pushLogs(message);
                }
                else if (topic === kafkaConstants.topics.success) {
                    handleSuccessJobs(message);
                }
                else{
                    handleFailedJobs(message);
                }
            },
        });

    } catch (error) {
        console.error("Monitoring service error:", error);
    }
}

const pushLogs = (message) => {
    try {
        const payload = monitorQueueHelper.unpreparePayload(message);
        console.log(`[MONITORING SSE SERVICE] Received: ${JSON.stringify(payload)}`);
        const jobId = payload.value?.job_id || payload.job_id;
        if (!jobId) return;

        const logMessage = payload.value?.message || payload.message;
        const logType = payload.value?.type || payload.type;
        const sseMessage = {
            type: logType,
            message: logMessage
        };
        if (jobClients[jobId]) {
            jobClients[jobId].forEach(res => {
                res.write(`data: ${JSON.stringify(sseMessage)}\n\n`);
            });
        }

    } catch (error) {
        console.error("Monitoring service error:", error);
    }
}

const handleSuccessJobs = (message) => {
    const value = message.value.toString();
    console.log(`[MONITORING SUCCESS SERVICE] Received: ${value}`);
    try {
        const payload = JSON.parse(value);

        const outputString = typeof payload.output === 'string' 
            ? payload.output 
            : JSON.stringify(payload.output);
        ExecutionDao.updateExecutionAfterRun(payload.id, {
            status: "completed",
            output: outputString
        });
    }
    catch (error) {
        console.error("Error parsing message value:", error);
        return;
    }
}

const handleFailedJobs = (message) => {
    const value = message.value.toString();
    console.log(`[MONITORING FAILED SERVICE] Received: ${value}`);
    const payload = JSON.parse(value);

    ExecutionDao.updateExecutionAfterRun(payload.id, {
        status: "failed",
        error: payload.error
    });
}

module.exports = {
    monitorStream,
    startListening
};