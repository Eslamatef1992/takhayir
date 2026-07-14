'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('vendor_payouts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      vendor_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'vendors', key: 'id' }, onDelete: 'CASCADE'
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'paid', 'failed'), allowNull: false, defaultValue: 'pending' },
      period_start: { type: Sequelize.DATEONLY, allowNull: false },
      period_end: { type: Sequelize.DATEONLY, allowNull: false },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('vendor_payouts')
};
