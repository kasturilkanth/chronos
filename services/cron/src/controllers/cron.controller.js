const ExecutionDao = require('@shared/mysql/daos/execution.dao');

const scheduleDueExecutions = async () => {
    try {
        const executions = await ExecutionDao.createExecutions();
    } catch (error) {
        console.error("Error fetching all cron jobs:", error);
    }
}

module.exports = {
    scheduleDueExecutions
};