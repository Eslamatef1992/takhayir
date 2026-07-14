import { Router } from 'express';
import * as productController from '../controllers/productController';
import { createProductValidator, updateProductValidator, productStatusValidator } from '../validators/productValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Browse/search active products (storefront)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: category slug
 *       - in: query
 *         name: vendor
 *         schema: { type: string }
 *         description: vendor store slug
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, rating] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Product list }
 *   post:
 *     tags: [Products]
 *     summary: Create a product (vendor only, goes to pending review)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.get('/', productController.listProducts);
router.post(
  '/',
  authenticate,
  requireRole('vendor'),
  createProductValidator,
  validateRequest,
  productController.createProduct
);

/**
 * @openapi
 * /api/products/mine:
 *   get:
 *     tags: [Products]
 *     summary: List my own products (vendor only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, pending, active, rejected, archived] }
 *     responses:
 *       200: { description: Product list }
 */
router.get('/mine', authenticate, requireRole('vendor'), productController.listMyProducts);

/**
 * @openapi
 * /api/products/admin/all:
 *   get:
 *     tags: [Products]
 *     summary: List all products for moderation (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product list }
 */
router.get('/admin/all', authenticate, requireRole('admin'), productController.adminListProducts);

/**
 * @openapi
 * /api/products/{id}/status:
 *   patch:
 *     tags: [Products]
 *     summary: Approve or reject a product listing (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 */
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  productStatusValidator,
  validateRequest,
  productController.updateProductStatus
);

/**
 * @openapi
 * /api/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Upload an image for one of my products (vendor only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Image added }
 */
router.post(
  '/:id/images',
  authenticate,
  requireRole('vendor'),
  upload.single('image'),
  productController.addProductImage
);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update one of my products (vendor only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Products]
 *     summary: Delete one of my products (vendor only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.put(
  '/:id',
  authenticate,
  requireRole('vendor'),
  updateProductValidator,
  validateRequest,
  productController.updateMyProduct
);
router.delete('/:id', authenticate, requireRole('vendor'), productController.deleteMyProduct);

/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by slug (public)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product }
 *       404: { description: Not found }
 */
router.get('/:slug', productController.getProductBySlug);

export default router;
