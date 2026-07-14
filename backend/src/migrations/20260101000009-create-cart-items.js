'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('cart_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      cart_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'carts', key: 'id' }, onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'products', key: 'id' }, onDelete: 'CASCADE'
      },
      variant_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'product_variants', key: 'id' }, onDelete: 'SET NULL'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      price_snapshot: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('cart_items')
};
