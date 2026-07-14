'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('product_variants', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'products', key: 'id' }, onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING(200), allowNull: false },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      stock_quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      attributes: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('product_variants')
};
