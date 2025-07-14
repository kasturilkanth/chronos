const CronController = require('./controllers/cron.controller');
const { sequelize } = require('@shared/mysql/config/connection')

const startCronService = async () => {
    console.log('Cron Service started successfully');
    setInterval(() => {
        CronController.scheduleDueExecutions();
    }, 1000);
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
    startCronService();
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });
