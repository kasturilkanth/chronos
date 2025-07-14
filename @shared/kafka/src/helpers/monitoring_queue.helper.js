
const preparePayload = ({ message, type = "default", jobId, jobTitle, executionId}) => {
    if(!message) {
        throw new Error("[MONITORING QUEUE HELPER] Message is required to prepare payload.");
    }
    if(!jobId) {
        throw new Error("[MONITORING QUEUE HELPER] JobId is required.");
    }
    let payload = {};
    payload.message = message;
    payload.type = type;
    if(!jobId){
        throw new Error("Monitor queue helper: jobId is required");
    }
    payload.job_id = jobId;
    if(!jobTitle){
        throw new Error("Monitor queue helper: jobTitle is required");
    }
    payload.job_title = jobTitle;
    if(executionId) {
        payload.execution_id = executionId;
    }
    return {
        key: jobId.toString(),
        value: JSON.stringify(payload)
    };
}

const unpreparePayload = (payload) => {
    try {
        const key = payload.key;
        const value = payload.value.toString();
        const jsonValue = JSON.parse(value);
        return {
            key: key,
            value: jsonValue,
        };
    } catch (error) {
        console.error("Failed to decode message payload:", error);
        return null;
    }
}

module.exports = {
    preparePayload,
    unpreparePayload
};