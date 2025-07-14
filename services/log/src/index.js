const app = require('./app');
const { sequelize } = require('@shared/mysql/config/connection_logs')
const kafkaConsumer = require('./consumer');
const { startListening } = require('./controllers/log.controller');

const startLogService = async () => {
    await kafkaConsumer.connect();
    startListening();
}

sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL database');

    sequelize.sync({ alter: true })
      .then(() => {
        console.log('Sequelize migrations have been run successfully');
      })
      .catch(syncErr => {
        console.error('Error running Sequelize migrations:', syncErr);
        process.exit(1);
      });
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, async () => {
      console.log(`Log Service is running on port ${PORT}`);
      startLogService();
    });
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });