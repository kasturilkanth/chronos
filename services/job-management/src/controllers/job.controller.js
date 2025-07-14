const JobDao = require('@shared/mysql/daos/job.dao'); 
const ExecutionDao = require('@shared/mysql/daos/execution.dao');

const createJob = async (req, res) => {
    try{
        const job = await JobDao.createJob(req.body);
        return res.status(201).send({ message: "Job created successfully", job });
    }
    catch (error) {
        console.error("Error creating job:", error);
        return res.status(500).send({ message: "Internal server error" });
    }
};

const getAllJobs = async (req, res) => {
    try{
        const jobs = await JobDao.getAllJobs();
        if (!jobs || jobs.length === 0) {
            return res.send({ message: "No jobs found", jobs: [] });
        }
        return res.status(200).send({ message: "Jobs retrieved successfully", jobs });
    }
    catch (error) {
        console.error("Error fetching all jobs:", error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const getJobById = async (req, res) => {
    try{
        const { id } = req.params;
        const job = await JobDao.getJobById(id);
        return res.status(200).send({ message: "Job retrieved successfully", job });
    }
    catch (error) {
        console.error(`Error fetching job with id ${req.params.id}:`, error);
        if( error.status === 404) {
            return res.status(404).send({ message: "Job not found" });
        }
        return res.status(500).send({ message: "Internal server error" });
    }
}

const getJobHistory = async (req, res) => {
    try{
        const { id } = req.params;
        const { page, pageSize } = req.query;
        
        const { executions, total } = await ExecutionDao.getExecutionHistory(id, page, pageSize);
        return res.status(200).send({ message: "Job history retrieved successfully", executions, totalPages: total });
    }
    catch (error) {
        console.error(`Error fetching job history with id ${req.params.id}:`, error);
        return res.status(500).send({ message: "Internal server error" });
    }
}

const updateJobStatus = async (req, res) => {
    try{
        const { id } = req.params;
        const job = await JobDao.updateJobStatus(id, req.body);
        return res.status(201).send({ message: "Job status updated successfully", job });
    }
    catch (error) {
        console.error("Error updating job status:", error);
        if( error.status === 404) {
            return res.status(404).send({ message: "Job not found" });
        }
        return res.status(500).send({ message: "Internal server error" });
    }
}

const updateJob = async (req, res) => {
    try{
        const { id } = req.params;
        const job = await JobDao.updateJob(id, req.body);
        return res.status(201).send({ message: "Job updated successfully", job });
    }
    catch (error) {
        console.error("Error updating job:", error);
        if( error.status === 404) {
            return res.status(404).send({ message: "Job not found" });
        }
        return res.status(500).send({ message: "Internal server error" });
    }
}

const removeJob = async (req, res) => { 
    try{
        const { id } = req.params;
        const job = await JobDao.removeJob(id);
        return res.status(201).send({ message: "Job removed successfully", job });
    }
    catch (error) {
        console.error("Error removing job:", error);
        if( error.status === 404) {
            return res.status(404).send({ message: "Job not found" });
        }
        return res.status(500).send({ message: "Internal server error" });
    }
}

module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    getJobHistory,
    updateJobStatus,
    updateJob,
    removeJob
};