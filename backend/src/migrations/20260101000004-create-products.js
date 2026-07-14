'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('products', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      vendor_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL'
      },
      name: { type: Sequelize.STRING(200), allowNull: false },
      slug: { type: Sequelize.STRING(220), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      compare_at_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      stock_quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      weight_kg: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
      status: { type: Sequelize.ENUM('draft', 'pending', 'active', 'rejected', 'archived'), allowNull: false, defaultValue: 'pending' },
      rejection_reason: { type: Sequelize.STRING(500), allowNull: true },
      is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      rating_avg: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      rating_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await qi.addIndex('products', ['category_id']);
    await qi.addIndex('products', ['vendor_id']);
    await qi.addIndex('products', ['status']);
  },
  down: async (qi) => qi.dropTable('products')
};
