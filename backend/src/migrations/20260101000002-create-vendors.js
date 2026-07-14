'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('vendors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false, unique: true,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE'
      },
      store_name: { type: Sequelize.STRING(150), allowNull: false },
      store_slug: { type: Sequelize.STRING(170), allowNull: false, unique: true },
      store_logo: { type: Sequelize.STRING(500), allowNull: true },
      store_banner: { type: Sequelize.STRING(500), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      business_type: { type: Sequelize.STRING(100), allowNull: true },
      tax_number: { type: Sequelize.STRING(100), allowNull: true },
      registration_number: { type: Sequelize.STRING(100), allowNull: true },
      iban: { type: Sequelize.STRING(50), allowNull: true },
      commission_rate: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 10.0 },
      status: { type: Sequelize.ENUM('pending', 'approved', 'suspended', 'rejected'), allowNull: false, defaultValue: 'pending' },
      rejection_reason: { type: Sequelize.STRING(500), allowNull: true },
      rating_avg: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('vendors')
};
