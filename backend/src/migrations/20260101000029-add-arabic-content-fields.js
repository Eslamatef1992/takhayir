'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'name_ar', { type: Sequelize.STRING(150), allowNull: true });
    await queryInterface.addColumn('categories', 'description_ar', { type: Sequelize.TEXT, allowNull: true });

    await queryInterface.addColumn('products', 'name_ar', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('products', 'description_ar', { type: Sequelize.TEXT, allowNull: true });

    await queryInterface.addColumn('pages', 'title_ar', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('pages', 'body_ar', { type: Sequelize.TEXT('long'), allowNull: true });

    await queryInterface.addColumn('vendors', 'description_ar', { type: Sequelize.TEXT, allowNull: true });

    await queryInterface.addColumn('banners', 'title_ar', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('banners', 'subtitle_ar', { type: Sequelize.STRING(300), allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categories', 'name_ar');
    await queryInterface.removeColumn('categories', 'description_ar');

    await queryInterface.removeColumn('products', 'name_ar');
    await queryInterface.removeColumn('products', 'description_ar');

    await queryInterface.removeColumn('pages', 'title_ar');
    await queryInterface.removeColumn('pages', 'body_ar');

    await queryInterface.removeColumn('vendors', 'description_ar');

    await queryInterface.removeColumn('banners', 'title_ar');
    await queryInterface.removeColumn('banners', 'subtitle_ar');
  }
};
