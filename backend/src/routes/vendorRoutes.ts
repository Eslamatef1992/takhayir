import { Router } from 'express';
import * as vendorController from '../controllers/vendorController';
import { updateVendorProfileValidator, vendorStatusValidator, commissionValidator } from '../validators/vendorValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/vendors:
 *   get:
 *     tags: [Vendors]
 *     summary: List approved vendor stores (public storefront directory)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Vendor list }
 */
router.get('/', vendorController.listVendors);

/**
 * @openapi
 * /api/vendors/me:
 *   get:
 *     tags: [Vendors]
 *     summary: Get my vendor store profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vendor profile }
 *   put:
 *     tags: [Vendors]
 *     summary: Update my vendor store profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 */
router.get('/me', authenticate, requireRole('vendor'), vendorController.getMyVendorProfile);
router.put(
  '/me',
  authenticate,
  requireRole('vendor'),
  updateVendorProfileValidator,
  validateRequest,
  vendorController.updateMyVendorProfile
);

/**
 * @openapi
 * /api/vendors/admin/all:
 *   get:
 *     tags: [Vendors]
 *     summary: List all vendors including pending/suspended (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, suspended, rejected] }
 *     responses:
 *       200: { description: Vendor list }
 */
router.get('/admin/all', authenticate, requireRole('admin'), vendorController.adminListVendors);

/**
 * @openapi
 * /api/vendors/{id}/status:
 *   patch:
 *     tags: [Vendors]
 *     summary: Approve, reject or suspend a vendor (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, approved, suspended, rejected] }
 *               rejection_reason: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  vendorStatusValidator,
  validateRequest,
  vendorController.updateVendorStatus
);

/**
 * @openapi
 * /api/vendors/{id}/commission:
 *   patch:
 *     tags: [Vendors]
 *     summary: Set a vendor's commission rate (admin only)
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
  '/:id/commission',
  authenticate,
  requireRole('admin'),
  commissionValidator,
  validateRequest,
  vendorController.updateVendorCommission
);

/**
 * @openapi
 * /api/vendors/{slug}:
 *   get:
 *     tags: [Vendors]
 *     summary: Get a public vendor store profile by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vendor profile }
 *       404: { description: Not found }
 */
router.get('/:slug', vendorController.getVendorBySlug);

export default router;
