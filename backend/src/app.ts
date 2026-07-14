import path from 'path';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { swaggerSpec } from './docs/swaggerOptions';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import vendorRoutes from './routes/vendorRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import addressRoutes from './routes/addressRoutes';
import reviewRoutes from './routes/reviewRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import paymentRoutes from './routes/paymentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

dotenv.config();

const app: Application = express();

// Allow the storefront, admin panel and vendor panel subdomains (plus any explicit origins).
const allowedOrigins = [
  process.env.CLIENT_STOREFRONT_URL,
  process.env.CLIENT_ADMIN_URL,
  process.env.CLIENT_VENDOR_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // permissive by default in this scaffold; tighten before going live
    },
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded product images / logos
app.use('/uploads', express.static(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

// Swagger docs — mounted so it resolves at back.takhayir.com/swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Takhayir API Docs' }));
app.get('/swagger.json', (_req, res) => res.json(swaggerSpec));

app.get('/health', (_req, res) => res.json({ success: true, message: 'Takhayir API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
