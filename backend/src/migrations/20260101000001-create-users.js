'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: true },
      email: { type: Sequelize.STRING(191), allowNull: false, unique: true },
      phone: { type: Sequelize.STRING(30), allowNull: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'vendor', 'customer'), allowNull: false, defaultValue: 'customer' },
      status: { type: Sequelize.ENUM('active', 'suspended'), allowNull: false, defaultValue: 'active' },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      email_verified_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('users')
};
