const { sequelize, Model, DataTypes} = require('../config/connection');

class Execution extends Model {
    static associate(models) {
        Execution.belongsTo(models.Job, {
            foreignKey: 'job_id',
            as: 'job'
        });
    }
}

const ExecutionModel = Execution.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'jobs',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    try_count: {
        type: DataTypes.INTEGER('2'),
        allowNull: false,
        defaultValue: 1
    },
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'in_queue', 'running', 'completed', 'failed', 'canceled'],
        allowNull: false,
        defaultValue: 'pending'
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    output: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Execution',
    tableName: 'executions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ExecutionModel;