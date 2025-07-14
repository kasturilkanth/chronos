const WorkerController = require('./controllers/worker.controller');
const { sequelize } = require('@shared/mysql/config/connection')
const { connectProducer } = require('@shared/kafka/src/producer');
const kafkaConsumer = require('./consumer');

const startWorkerService = async () => {
    await connectProducer();
    await kafkaConsumer.connect();
    WorkerController.fetchAndExecute();
}

sequelize.authenticate()
  .then(() => {
    console.log('Worker service connected to MySQL database');
    startWorkerService();
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });
