-- Create databases
CREATE DATABASE IF NOT EXISTS job_scheduler;
CREATE DATABASE IF NOT EXISTS job_notifications;
CREATE DATABASE IF NOT EXISTS job_logs;

-- Grant privileges to doc_manager user
GRANT ALL PRIVILEGES ON job_scheduler.* TO 'chronos'@'%';
GRANT ALL PRIVILEGES ON job_notifications.* TO 'chronos'@'%';
GRANT ALL PRIVILEGES ON job_logs.* TO 'chronos'@'%';

FLUSH PRIVILEGES;