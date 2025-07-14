const { LogModel } = require("../models");

const insert = async (data) => {
    try{
        const { job_id, job_title, execution_id, message, level } = data;
        const log = await LogModel.create({
            job_id,
            job_title,
            execution_id,
            message,
            level
        })

        return log;
    }
    catch (error){
        console.error("Error creating log:", error);
        throw error;
    }
}

const getLogHistory = async (jobId, page = 1, pageSize = 10) => {
    try {
        const offset = (page - 1) * pageSize;
        const { rows: executions, count: total } = await LogModel.findAndCountAll({
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
    insert,
    getLogHistory
}