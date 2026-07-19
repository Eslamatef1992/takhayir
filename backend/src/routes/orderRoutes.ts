import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { checkoutValidator, guestCheckoutValidator, orderStatusValidator, adminOrderStatusValidator } from '../validators/orderValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole, gateAdminRole } from '../middleware/roles';

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
 * /api/orders/guest-checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Checkout without an account — cart items, guest contact info and shipping address are sent inline
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, guest, shipping, payment_method]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: integer }
 *                     variant_id: { type: integer }
 *                     quantity: { type: integer }
 *               guest:
 *                 type: object
 *                 properties:
 *                   full_name: { type: string }
 *                   email: { type: string }
 *                   phone: { type: string }
 *               shipping:
 *                 type: object
 *                 properties:
 *                   country: { type: string }
 *                   city: { type: string }
 *                   area: { type: string }
 *                   street: { type: string }
 *                   building: { type: string }
 *                   notes: { type: string }
 *               payment_method: { type: string, enum: [tap, deema, taly, cod] }
 *               coupon_code: { type: string }
 *     responses:
 *       201: { description: Order created, returns checkout_url if applicable }
 */
router.post('/guest-checkout', guestCheckoutValidator, validateRequest, orderController.guestCheckoutOrder);

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
 * /api/orders/admin/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update an order's overall status and/or payment status (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, processing, shipped, delivered, cancelled, refunded] }
 *               payment_status: { type: string, enum: [unpaid, paid, failed, refunded] }
 *     responses:
 *       200: { description: Updated }
 */
router.patch(
  '/admin/:id/status',
  authenticate,
  requireRole('admin'),
  gateAdminRole('orders'),
  adminOrderStatusValidator,
  validateRequest,
  orderController.adminUpdateOrderStatus
);

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
