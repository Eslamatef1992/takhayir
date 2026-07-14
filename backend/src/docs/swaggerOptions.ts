import swaggerJSDoc from 'swagger-jsdoc';

const apiUrl = process.env.API_URL || 'http://localhost:4000';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Takhayir Marketplace API',
      version: '1.0.0',
      description:
        'REST API for the Takhayir multi-vendor e-commerce platform. Covers auth, categories, vendors, products, cart, checkout, orders, coupons, reviews, wishlist and payment webhooks (Tap direct gateway, Deema BNPL, Taly BNPL).',
      contact: { name: 'Teknulugy', url: 'https://teknulugy.com' }
    },
    servers: [
      { url: apiUrl, description: 'Current environment' },
      { url: 'https://back.takhayir.com', description: 'Production' },
      { url: 'http://localhost:4000', description: 'Local development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    tags: [
      { name: 'Auth' },
      { name: 'Categories' },
      { name: 'Vendors' },
      { name: 'Products' },
      { name: 'Cart' },
      { name: 'Orders' },
      { name: 'Coupons' },
      { name: 'Addresses' },
      { name: 'Reviews' },
      { name: 'Wishlist' },
      { name: 'Payments' },
      { name: 'Dashboard' },
      { name: 'Banners' }
    ]
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);
