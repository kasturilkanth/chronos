const { Router } = require('express');
const { getLogs } = require('../controllers/log.controller');

const router = Router();

router.get('/logs/:jobId', getLogs);

module.exports = router;