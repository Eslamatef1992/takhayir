'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('variant_types', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });

    await queryInterface.createTable('variant_values', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      variant_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'variant_types', key: 'id' },
        onDelete: 'CASCADE'
      },
      value: { type: Sequelize.STRING(100), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });

    const now = new Date();
    await queryInterface.bulkInsert('variant_types', [
      { name: 'Color', created_at: now, updated_at: now },
      { name: 'Storage', created_at: now, updated_at: now },
      { name: 'Size', created_at: now, updated_at: now }
    ]);

    const [types] = await queryInterface.sequelize.query('SELECT id, name FROM variant_types');
    const byName = Object.fromEntries(types.map((t) => [t.name, t.id]));

    await queryInterface.bulkInsert('variant_values', [
      ...['Black', 'White', 'Silver', 'Blue', 'Red', 'Gold'].map((value) => ({
        variant_type_id: byName.Color, value, created_at: now, updated_at: now
      })),
      ...['64GB', '128GB', '256GB', '512GB', '1TB'].map((value) => ({
        variant_type_id: byName.Storage, value, created_at: now, updated_at: now
      })),
      ...['Small', 'Medium', 'Large', 'X-Large'].map((value) => ({
        variant_type_id: byName.Size, value, created_at: now, updated_at: now
      }))
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('variant_values');
    await queryInterface.dropTable('variant_types');
  }
};
