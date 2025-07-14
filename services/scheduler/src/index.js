const SchedulerController = require('./controllers/scheduler.controller');
const { sequelize } = require('@shared/mysql/config/connection')
const { connectProducer } = require('@shared/kafka/src/producer');

const startSchedulerService = async () => {
    await connectProducer();
    setInterval(() => {
        SchedulerController.startScheduling();
    }, 1000);
}

sequelize.authenticate()
  .then(() => {
    console.log('Scheduler service connected to MySQL database');
    startSchedulerService();
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });
