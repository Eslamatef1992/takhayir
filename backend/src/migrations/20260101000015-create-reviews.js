'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('reviews', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'products', key: 'id' }, onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'CASCADE'
      },
      order_item_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'order_items', key: 'id' }, onDelete: 'SET NULL'
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: true },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'approved' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('reviews')
};
