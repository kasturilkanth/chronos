const { Router } = require('express');
const proxy = require('../proxy');

const router = Router();

router.use('/jobs', proxy('job'));
router.use('/monitor', proxy('monitoring'));

module.exports = router;