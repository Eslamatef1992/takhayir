import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { sequelize } from './models';

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('Database connection established.');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Takhayir API listening on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`Swagger docs available at ${process.env.API_URL || `http://localhost:${PORT}`}/swagger`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
