'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE'
      },
      gateway: { type: Sequelize.ENUM('tap', 'deema', 'taly', 'cod'), allowNull: false },
      gateway_reference: { type: Sequelize.STRING(150), allowNull: true },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'SAR' },
      status: { type: Sequelize.ENUM('initiated', 'pending', 'captured', 'failed', 'cancelled', 'refunded'), allowNull: false, defaultValue: 'initiated' },
      raw_response: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('payments')
};
