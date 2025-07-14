const { sequelize, Model, DataTypes } = require('@shared/mysql/config/connection_logs');

class Log extends Model {}

const LogModel = Log.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    job_title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    execution_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    level: {
        type: DataTypes.ENUM,
        values: ['info', 'warning', 'error', 'success'],
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Log',
    tableName: 'logs',
    timestamps: false
});

module.exports = LogModel;