// Sequelize CLI config (used by migrations/seeders). Loads from .env.
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'takhayir',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false
};

module.exports = {
  development: base,
  test: { ...base, database: (process.env.DB_NAME || 'takhayir') + '_test' },
  production: { ...base, logging: false }
};
