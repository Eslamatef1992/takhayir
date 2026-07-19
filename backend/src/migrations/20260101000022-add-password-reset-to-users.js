'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.addColumn('users', 'password_reset_token_hash', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await qi.addColumn('users', 'password_reset_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
  down: async (qi) => {
    await qi.removeColumn('users', 'password_reset_token_hash');
    await qi.removeColumn('users', 'password_reset_expires');
  }
};
