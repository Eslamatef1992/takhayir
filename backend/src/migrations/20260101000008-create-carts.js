'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('carts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      session_id: { type: Sequelize.STRING(150), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('carts')
};
