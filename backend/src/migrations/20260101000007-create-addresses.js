'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('addresses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      label: { type: Sequelize.STRING(100), allowNull: true },
      full_name: { type: Sequelize.STRING(150), allowNull: false },
      phone: { type: Sequelize.STRING(30), allowNull: false },
      country: { type: Sequelize.STRING(100), allowNull: false },
      city: { type: Sequelize.STRING(100), allowNull: false },
      area: { type: Sequelize.STRING(100), allowNull: true },
      street: { type: Sequelize.STRING(255), allowNull: true },
      building: { type: Sequelize.STRING(100), allowNull: true },
      notes: { type: Sequelize.STRING(500), allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('addresses')
};
