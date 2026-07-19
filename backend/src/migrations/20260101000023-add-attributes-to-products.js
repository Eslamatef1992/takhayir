'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'attributes', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'attributes');
  }
};
