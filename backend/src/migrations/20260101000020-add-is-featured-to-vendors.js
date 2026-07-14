'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.addColumn('vendors', 'is_featured', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },
  down: async (qi) => qi.removeColumn('vendors', 'is_featured')
};
