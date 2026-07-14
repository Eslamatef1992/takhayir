'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (qi) => {
    const password_hash = await bcrypt.hash('ChangeMe123!', 10);
    await qi.bulkInsert('users', [
      {
        first_name: 'Takhayir',
        last_name: 'Admin',
        email: 'admin@takhayir.com',
        phone: null,
        password_hash,
        role: 'admin',
        status: 'active',
        avatar_url: null,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (qi) => qi.bulkDelete('users', { email: 'admin@takhayir.com' })
};
