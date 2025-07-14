
const { sequelize, Model, DataTypes} = require('../config/connection');

class Job extends Model {
    static associate(models) {
        Job.hasMany(models.Execution, {
            foreignKey: 'job_id',
            as: 'executions'
        });
    }
}

const JobModel = Job.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    identifier: {
        type: DataTypes.STRING,
        allowNull: false
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM,
        values: ['shell', 'email', 'http'],
        allowNull: false
    },
    schedule_expression : {
        type: DataTypes.STRING,
        allowNull: false
    },
    command: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    payload: {
        type: DataTypes.JSON,
        allowNull: true
    },
    retry_strategy: {
        type: DataTypes.ENUM,
        values: ['immediate', 'exponential', 'linear'],
        allowNull: false,
        defaultValue: 'immediate'
    },
    max_retries: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'running', 'completed', 'paused', 'retry', 'failed'],
        allowNull: false,
        defaultValue: 'pending'
    },
    last_run_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    next_run_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    underscored: true,
    timestamps: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        {
            unique: true,
            fields: ['identifier', 'version']
        }
    ]
});

module.exports = JobModel;