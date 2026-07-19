'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.addColumn('vendors', 'store_name_ar', {
      type: Sequelize.STRING(150),
      allowNull: true
    });
    await qi.addColumn('vendors', 'business_license_url', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
    await qi.addColumn('vendors', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'categories', key: 'id' },
      onDelete: 'SET NULL'
    });
  },
  down: async (qi) => {
    await qi.removeColumn('vendors', 'store_name_ar');
    await qi.removeColumn('vendors', 'business_license_url');
    await qi.removeColumn('vendors', 'category_id');
  }
};
