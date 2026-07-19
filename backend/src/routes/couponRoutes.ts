import { Router } from 'express';
import * as couponController from '../controllers/couponController';
import { couponValidator } from '../validators/couponValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { body } from 'express-validator';

const router = Router();

/**
 * @openapi
 * /api/coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: List my coupons (vendor sees own, admin sees platform-wide)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Coupon list }
 *   post:
 *     tags: [Coupons]
 *     summary: Create a coupon (admin = platform-wide, vendor = store-only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.get('/', authenticate, requireRole('admin', 'vendor'), couponController.listMyCoupons);
router.post('/', authenticate, requireRole('admin', 'vendor'), couponValidator, validateRequest, couponController.createCoupon);

/**
 * @openapi
 * /api/coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Validate a coupon code against a cart subtotal (checkout step)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, subtotal]
 *             properties:
 *               code: { type: string }
 *               subtotal: { type: number }
 *     responses:
 *       200: { description: Discount amount }
 */
router.post(
  '/validate',
  authenticate,
  [body('code').notEmpty(), body('subtotal').isFloat({ min: 0 })],
  validateRequest,
  couponController.validateCoupon
);

/**
 * @openapi
 * /api/coupons/available:
 *   get:
 *     tags: [Coupons]
 *     summary: List currently usable coupons (customer-facing "My Coupons")
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Coupon list }
 */
router.get('/available', authenticate, couponController.listAvailableCoupons);

/**
 * @openapi
 * /api/coupons/{id}:
 *   delete:
 *     tags: [Coupons]
 *     summary: Delete a coupon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.delete('/:id', authenticate, requireRole('admin', 'vendor'), couponController.deleteCoupon);

export default router;
