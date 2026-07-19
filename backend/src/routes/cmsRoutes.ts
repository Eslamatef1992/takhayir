import { Router } from 'express';
import * as cmsController from '../controllers/cmsController';
import { updatePageValidator } from '../validators/cmsValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole, gateAdminRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/cms/public/{slug}:
 *   get:
 *     tags: [CMS]
 *     summary: Get a static page's content by slug (public, storefront)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Page }
 *       404: { description: Not found }
 */
router.get('/public/:slug', cmsController.getPublicPage);

/**
 * @openapi
 * /api/cms/pages:
 *   get:
 *     tags: [CMS]
 *     summary: List all static pages (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Page list }
 */
router.get('/pages', authenticate, requireRole('admin'), cmsController.adminListPages);

/**
 * @openapi
 * /api/cms/pages/{slug}:
 *   get:
 *     tags: [CMS]
 *     summary: Get a static page by slug (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Page }
 *   put:
 *     tags: [CMS]
 *     summary: Edit a static page's title/body (product_manager/super_admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 */
router.get('/pages/:slug', authenticate, requireRole('admin'), cmsController.adminGetPage);
router.put(
  '/pages/:slug',
  authenticate,
  requireRole('admin'),
  gateAdminRole('cms'),
  updatePageValidator,
  validateRequest,
  cmsController.adminUpdatePage
);

export default router;
