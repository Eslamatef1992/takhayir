'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vendor_categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vendors', key: 'id' },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });

    await queryInterface.addIndex('vendor_categories', ['vendor_id', 'category_id'], {
      unique: true,
      name: 'vendor_categories_vendor_category_unique'
    });

    // Carry forward each vendor's existing single category into the new
    // many-to-many table, so nothing already assigned is lost.
    await queryInterface.sequelize.query(`
      INSERT INTO vendor_categories (vendor_id, category_id, created_at, updated_at)
      SELECT id, category_id, NOW(), NOW() FROM vendors WHERE category_id IS NOT NULL
    `);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('vendor_categories');
  }
};
