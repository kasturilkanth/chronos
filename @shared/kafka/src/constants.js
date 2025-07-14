module.exports = {
    topics: {
        scheduled: 'scheduled-jobs',
        success: 'success-jobs',
        error: 'error-jobs',
        monitor: 'monitor-jobs'
    },
    groups: {
        worker: 'worker-service-group',
        monitor: 'monitor-service-group',
        retry: 'retry-service-group',
        log: 'log-service-group',
    }
}