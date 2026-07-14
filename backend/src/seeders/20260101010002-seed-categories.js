'use strict';

module.exports = {
  up: async (qi) => {
    const now = new Date();
    const top = [
      { name: 'Fashion', slug: 'fashion' },
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Home & Living', slug: 'home-living' },
      { name: 'Beauty & Health', slug: 'beauty-health' },
      { name: 'Groceries', slug: 'groceries' },
      { name: 'Sports & Outdoors', slug: 'sports-outdoors' }
    ];

    for (let i = 0; i < top.length; i += 1) {
      await qi.bulkInsert('categories', [
        {
          parent_id: null,
          name: top[i].name,
          slug: top[i].slug,
          description: null,
          icon: null,
          image: null,
          is_active: true,
          sort_order: i,
          created_at: now,
          updated_at: now
        }
      ]);
    }

    const [fashion] = await qi.sequelize.query("SELECT id FROM categories WHERE slug='fashion'");
    const [electronics] = await qi.sequelize.query("SELECT id FROM categories WHERE slug='electronics'");

    const subcats = [
      { parent: fashion[0].id, name: "Men's Clothing", slug: 'mens-clothing' },
      { parent: fashion[0].id, name: "Women's Clothing", slug: 'womens-clothing' },
      { parent: electronics[0].id, name: 'Mobile Phones', slug: 'mobile-phones' },
      { parent: electronics[0].id, name: 'Laptops & Computers', slug: 'laptops-computers' }
    ];

    for (let i = 0; i < subcats.length; i += 1) {
      await qi.bulkInsert('categories', [
        {
          parent_id: subcats[i].parent,
          name: subcats[i].name,
          slug: subcats[i].slug,
          description: null,
          icon: null,
          image: null,
          is_active: true,
          sort_order: i,
          created_at: now,
          updated_at: now
        }
      ]);
    }
  },
  down: async (qi) => qi.bulkDelete('categories', null, {})
};
