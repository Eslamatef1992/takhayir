'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('order_vendor_groups', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        allowNull: false, defaultValue: 'pending'
      },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      commission_rate: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      commission_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payout_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tracking_number: { type: Sequelize.STRING(100), allowNull: true },
      shipped_at: { type: Sequelize.DATE, allowNull: true },
      delivered_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await qi.addIndex('order_vendor_groups', ['vendor_id']);
  },
  down: async (qi) => qi.dropTable('order_vendor_groups')
};
