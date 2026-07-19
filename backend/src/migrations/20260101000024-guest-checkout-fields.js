'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('orders', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'guest_name', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('orders', 'guest_email', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('orders', 'guest_phone', { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_full_name', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_phone', { type: Sequelize.STRING(30), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_country', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_city', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_area', { type: Sequelize.STRING(150), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_street', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_building', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('orders', 'shipping_notes', { type: Sequelize.STRING(500), allowNull: true });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('orders', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.removeColumn('orders', 'guest_name');
    await queryInterface.removeColumn('orders', 'guest_email');
    await queryInterface.removeColumn('orders', 'guest_phone');
    await queryInterface.removeColumn('orders', 'shipping_full_name');
    await queryInterface.removeColumn('orders', 'shipping_phone');
    await queryInterface.removeColumn('orders', 'shipping_country');
    await queryInterface.removeColumn('orders', 'shipping_city');
    await queryInterface.removeColumn('orders', 'shipping_area');
    await queryInterface.removeColumn('orders', 'shipping_street');
    await queryInterface.removeColumn('orders', 'shipping_building');
    await queryInterface.removeColumn('orders', 'shipping_notes');
  }
};
