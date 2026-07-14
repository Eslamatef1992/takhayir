'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('notifications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      title: { type: Sequelize.STRING(200), allowNull: false },
      message: { type: Sequelize.STRING(500), allowNull: false },
      type: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'general' },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('notifications')
};
