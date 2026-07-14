import { Router } from 'express';
import * as bannerController from '../controllers/bannerController';
import { createBannerValidator, updateBannerValidator } from '../validators/bannerValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @openapi
 * /api/banners:
 *   get:
 *     tags: [Banners]
 *     summary: List active homepage hero banners (public, storefront)
 *     responses:
 *       200: { description: Banner list }
 *   post:
 *     tags: [Banners]
 *     summary: Create a homepage banner (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image_url]
 *             properties:
 *               title: { type: string }
 *               subtitle: { type: string }
 *               image_url: { type: string }
 *               link_url: { type: string }
 *               is_active: { type: boolean }
 *               sort_order: { type: integer }
 *     responses:
 *       201: { description: Created }
 */
router.get('/', bannerController.listActiveBanners);
router.post('/', authenticate, requireRole('admin'), createBannerValidator, validateRequest, bannerController.createBanner);

/**
 * @openapi
 * /api/banners/admin/all:
 *   get:
 *     tags: [Banners]
 *     summary: List all banners including inactive ones (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Banner list }
 */
router.get('/admin/all', authenticate, requireRole('admin'), bannerController.adminListBanners);

/**
 * @openapi
 * /api/banners/upload:
 *   post:
 *     tags: [Banners]
 *     summary: Upload a banner image and get back its URL (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Image uploaded, returns { url } }
 */
router.post('/upload', authenticate, requireRole('admin'), upload.single('image'), bannerController.uploadBannerImage);

/**
 * @openapi
 * /api/banners/{id}:
 *   put:
 *     tags: [Banners]
 *     summary: Update a banner (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Banners]
 *     summary: Delete a banner (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.put('/:id', authenticate, requireRole('admin'), updateBannerValidator, validateRequest, bannerController.updateBanner);
router.delete('/:id', authenticate, requireRole('admin'), bannerController.deleteBanner);

export default router;
