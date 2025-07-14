const app = require('./app');
const { sequelize } = require('@shared/mysql/config/connection')
const kafkaConsumer = require('./consumer');
const { startListening } = require('./controllers/monitor.controller');

const startMonitoringService = async () => {
    await kafkaConsumer.connect();
    startListening();
}

sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL database');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, async () => {
      console.log(`Monitoring Service is running on port ${PORT}`);
      startMonitoringService();
    });
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });