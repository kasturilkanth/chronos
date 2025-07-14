const app = require('./app');
const { sequelize } = require('@shared/mysql/config/connection')

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
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Job Management Service is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the MySQL database:', err);
  });