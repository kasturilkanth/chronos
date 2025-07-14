const { Sequelize } = require('sequelize');

const defaultConnection = new Sequelize(
    process.env.DB_NOTIFICATION_NAME || 'default_db',
    process.env.DB_USER || 'username', 
    process.env.DB_PASS || 'password', 
    {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Disable logging for production
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000, // 60 seconds
        timezone: 'Z' // Use UTC timezone
    }
});

module.exports = {
  sequelize: defaultConnection,
  Sequelize, // The actual class
  DataTypes: Sequelize.DataTypes,
  Model: Sequelize.Model
};