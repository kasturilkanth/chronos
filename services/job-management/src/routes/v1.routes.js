const { Router } = require('express');
const { body } = require('express-validator');
const { 
    createJob,
    getAllJobs,
    getJobById,
    getJobHistory,
    updateJobStatus,
    updateJob,
    removeJob 
} = require('../controllers/job.controller');
const validate = require('@shared/middlewares/validate');
const validator = require('../validations/job.validation')

const router = Router();

router.post("/", validator, createJob);
router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.get("/:id/history", getJobHistory);
router.patch("/:id/status", [
    body('status').isIn(['running', 'paused', 'completed']).withMessage('Invalid job status'),
    validate
], updateJobStatus);
router.put("/:id", validator, updateJob);
router.delete("/:id", removeJob);

module.exports = router;