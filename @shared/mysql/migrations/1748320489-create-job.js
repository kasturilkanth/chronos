module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('jobs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      identifier: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM,
        values: ['shell', 'email', 'http'],
        allowNull: false,
      },
      schedule_expression: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      command: {
          type: Sequelize.TEXT,
          allowNull: false
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['pending', 'scheduled', 'running', 'completed', 'paused', 'failed'],
        allowNull: false,
        defaultValue: 'pending',
      },
      last_run_at: {
          type: DataTypes.DATE,
          allowNull: true
      },
      next_run_at: {
          type: DataTypes.DATE,
          allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
          type: DataTypes.DATE,
          allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('jobs');
  },
};