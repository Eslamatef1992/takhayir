'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'admin_role', {
      type: Sequelize.ENUM('super_admin', 'orders_manager', 'product_manager', 'support'),
      allowNull: true
    });
    // Any existing admin accounts keep full access under the new role system.
    await queryInterface.sequelize.query(
      "UPDATE users SET admin_role = 'super_admin' WHERE role = 'admin'"
    );
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'admin_role');
  }
};
