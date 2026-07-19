import { Router } from 'express';
import * as variantController from '../controllers/variantController';
import { variantTypeValidator, variantValueValidator } from '../validators/variantValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole, gateAdminRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/variant-types:
 *   get:
 *     tags: [Variants]
 *     summary: List variant types with their values (admin/vendor, used to build product variant pickers)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Variant type list }
 *   post:
 *     tags: [Variants]
 *     summary: Create a variant type (product_manager/super_admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.get('/', authenticate, requireRole('admin', 'vendor'), variantController.listVariantTypes);
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  gateAdminRole('variants'),
  variantTypeValidator,
  validateRequest,
  variantController.createVariantType
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  gateAdminRole('variants'),
  variantTypeValidator,
  validateRequest,
  variantController.updateVariantType
);
router.delete('/:id', authenticate, requireRole('admin'), gateAdminRole('variants'), variantController.deleteVariantType);

router.post(
  '/:typeId/values',
  authenticate,
  requireRole('admin'),
  gateAdminRole('variants'),
  variantValueValidator,
  validateRequest,
  variantController.createVariantValue
);
router.put(
  '/values/:id',
  authenticate,
  requireRole('admin'),
  gateAdminRole('variants'),
  variantValueValidator,
  validateRequest,
  variantController.updateVariantValue
);
router.delete('/values/:id', authenticate, requireRole('admin'), gateAdminRole('variants'), variantController.deleteVariantValue);

export default router;
