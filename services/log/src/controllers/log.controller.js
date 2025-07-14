const LogDao = require('@shared/mysql/daos/log.dao');
const monitorQueueHelper = require('@shared/kafka/src/helpers/monitoring_queue.helper');
const consumer = require('../consumer');
const kafkaConstants = require('@shared/kafka/src/constants');

const startListening = async () => {
    try {
        // const jobId = req.params.jobId;
        
        await consumer.subscribe({ topic: kafkaConstants.topics.monitor, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                saveLogs(message);
            },
        });

    } catch (error) {
        console.error("Log service error:", error);
    }
}

const saveLogs = async (message) => {
    try {
        const payload = monitorQueueHelper.unpreparePayload(message);
        console.log(`[LOG SERVICE] Received: ${payload.value.toString()}`);
        const jobId = payload.value?.job_id || payload.job_id;
        if (!jobId) return;
        const executionId = payload.value?.execution_id || payload.execution_id;
        if (!executionId) return;
        const jobTitle = payload.value?.job_title || payload.job_title;

        const logMessage = payload.value?.message || payload.message;
        const logType = payload.value?.type || payload.type;
        await LogDao.insert({
            job_id: jobId,
            job_title: jobTitle,
            execution_id: executionId,
            message: logMessage,
            level: logType === "default" ? "info" : logType
        });

    } catch (error) {
        console.error("Log service error:", error);
    }
}

const getLogs = async (req, res) => {
    try{
        const { id } = req.params;
        const { page, pageSize } = req.query;
        
        const { executions, total } = await LogDao.getLogHistory(id, page, pageSize);
        return res.status(200).send({ message: "Log history retrieved successfully", executions, totalPages: total });
    }
    catch (error) {
        console.error(`Error fetching log history with id ${req.params.id}:`, error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

module.exports = {
    startListening,
    getLogs
};