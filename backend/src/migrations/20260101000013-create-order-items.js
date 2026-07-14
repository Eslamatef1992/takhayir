'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('order_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      order_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE'
      },
      order_vendor_group_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'order_vendor_groups', key: 'id' }, onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'products', key: 'id' }, onDelete: 'SET NULL'
      },
      variant_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'product_variants', key: 'id' }, onDelete: 'SET NULL'
      },
      vendor_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'RESTRICT'
      },
      product_name_snapshot: { type: Sequelize.STRING(200), allowNull: false },
      sku_snapshot: { type: Sequelize.STRING(100), allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('order_items')
};
