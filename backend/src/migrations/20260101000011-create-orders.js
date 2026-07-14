'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_number: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'RESTRICT'
      },
      shipping_address_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'addresses', key: 'id' }, onDelete: 'SET NULL'
      },
      coupon_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'coupons', key: 'id' }, onDelete: 'SET NULL'
      },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      shipping_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      tax_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      grand_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      currency: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'SAR' },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
        allowNull: false, defaultValue: 'pending'
      },
      payment_status: { type: Sequelize.ENUM('unpaid', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'unpaid' },
      payment_method: { type: Sequelize.STRING(50), allowNull: true },
      notes: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await qi.addIndex('orders', ['user_id']);
  },
  down: async (qi) => qi.dropTable('orders')
};
