'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('wishlists', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'products', key: 'id' }, onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await qi.addIndex('wishlists', ['user_id', 'product_id'], { unique: true, name: 'wishlists_user_product_unique' });
  },
  down: async (qi) => qi.dropTable('wishlists')
};
