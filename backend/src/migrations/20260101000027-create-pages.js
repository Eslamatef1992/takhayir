'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pages', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      title: { type: Sequelize.STRING(200), allowNull: false },
      body: { type: Sequelize.TEXT('long'), allowNull: false },
      meta_description: { type: Sequelize.STRING(300), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });

    const now = new Date();
    await queryInterface.bulkInsert('pages', [
      {
        slug: 'about-us',
        title: 'About Us',
        body: '<p>Welcome to Takhayir — a marketplace for every kind of business, bringing together independent vendors across fashion, electronics, home goods and more, all under one cart and one checkout.</p><p>Add your own story here from the admin panel.</p>',
        meta_description: 'Learn more about Takhayir, the marketplace for independent vendors in Kuwait.',
        created_at: now, updated_at: now
      },
      {
        slug: 'terms-conditions',
        title: 'Terms & Conditions',
        body: '<p>These Terms & Conditions govern your use of Takhayir. Please replace this placeholder text with your actual terms from the admin panel.</p>',
        meta_description: 'Read the Takhayir terms and conditions.',
        created_at: now, updated_at: now
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        body: '<p>This Privacy Policy explains how Takhayir collects, uses and protects your information. Please replace this placeholder text with your actual policy from the admin panel.</p>',
        meta_description: 'Read the Takhayir privacy policy.',
        created_at: now, updated_at: now
      },
      {
        slug: 'faq',
        title: 'Frequently Asked Questions',
        body: '<p><strong>How do I place an order?</strong><br/>Browse products, add them to your cart, and check out — no account required.</p><p><strong>What payment methods are supported?</strong><br/>Cards, Apple Pay, KNET, and installment plans via Taly and Deema.</p>',
        meta_description: 'Answers to common questions about shopping on Takhayir.',
        created_at: now, updated_at: now
      },
      {
        slug: 'returns-policy',
        title: 'Contact & Return Policy',
        body: '<p>For questions about an order, contact the vendor directly from your order details, or reach Takhayir support. Please replace this placeholder text with your actual return policy from the admin panel.</p>',
        meta_description: 'Takhayir contact information and return policy.',
        created_at: now, updated_at: now
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('pages');
  }
};
