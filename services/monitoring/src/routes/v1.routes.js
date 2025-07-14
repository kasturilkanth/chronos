const { Router } = require('express');
const { monitorStream } = require('../controllers/monitor.controller');

const router = Router();

router.get('/logs/:jobId', monitorStream);

module.exports = router;