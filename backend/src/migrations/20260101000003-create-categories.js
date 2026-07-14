'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      parent_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL'
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      slug: { type: Sequelize.STRING(170), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      icon: { type: Sequelize.STRING(500), allowNull: true },
      image: { type: Sequelize.STRING(500), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (qi) => qi.dropTable('categories')
};
