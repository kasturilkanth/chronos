const RetryController = require('./controllers/retry.controller');
const { sequelize } = require('@shared/mysql/config/connection')
const kafkaConsumer = require('./consumer');

const startRetryService = async () => {
    await kafkaConsumer.connect();
    RetryController.decideAndExecuteRetry();
}

sequelize.authenticate()
  .then(() => {
    console.log('Worker service connected to MySQL database');
    startRetryService();
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });
