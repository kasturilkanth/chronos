const JobModel = require('./job.model');
const ExecutionModel = require('./execution.model');
const LogModel = require('./log.model');

// Setup associations
JobModel.associate({ Execution: ExecutionModel });
ExecutionModel.associate({ Job: JobModel });


module.exports = { JobModel, ExecutionModel, LogModel };