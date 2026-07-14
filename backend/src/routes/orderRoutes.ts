import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { checkoutValidator, orderStatusValidator } from '../validators/orderValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Checkout my cart — splits into per-vendor sub-orders and initiates payment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shipping_address_id, payment_method]
 *             properties:
 *               shipping_address_id: { type: integer }
 *               payment_method: { type: string, enum: [tap, deema, taly, cod] }
 *               coupon_code: { type: string }
 *     responses:
 *       201: { description: Order created, returns checkout_url if applicable }
 */
router.post('/checkout', authenticate, requireRole('customer'), checkoutValidator, validateRequest, orderController.checkoutOrder);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List my orders (customer)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order list }
 */
router.get('/', authenticate, requireRole('customer'), orderController.listMyOrders);

/**
 * @openapi
 * /api/orders/vendor/mine:
 *   get:
 *     tags: [Orders]
 *     summary: List my store's sub-orders (vendor)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200: { description: Sub-order list }
 */
router.get('/vendor/mine', authenticate, requireRole('vendor'), orderController.listVendorOrders);

/**
 * @openapi
 * /api/orders/vendor/groups/{groupId}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update the fulfillment status of one of my sub-orders (vendor)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 */
router.patch(
  '/vendor/groups/:groupId/status',
  authenticate,
  requireRole('vendor'),
  orderStatusValidator,
  validateRequest,
  orderController.updateVendorOrderGroupStatus
);

/**
 * @openapi
 * /api/orders/admin/all:
 *   get:
 *     tags: [Orders]
 *     summary: List all platform orders (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order list }
 */
router.get('/admin/all', authenticate, requireRole('admin'), orderController.adminListOrders);

/**
 * @openapi
 * /api/orders/admin/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get any order by id (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order }
 */
router.get('/admin/:id', authenticate, requireRole('admin'), orderController.adminGetOrder);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get one of my orders by id (customer)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order }
 */
router.get('/:id', authenticate, requireRole('customer'), orderController.getMyOrder);

export default router;
