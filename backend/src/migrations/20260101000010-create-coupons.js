'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('coupons', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      vendor_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'vendors', key: 'id' }, onDelete: 'CASCADE'
      },
      code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      type: { type: Sequelize.ENUM('fixed', 'percent'), allowNull: false, defaultValue: 'percent' },
      value: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      min_order_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      usage_limit: { type: Sequelize.INTEGER, allowNull: true },
      used_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      starts_at: { type: Sequelize.DATE, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('coupons')
};
