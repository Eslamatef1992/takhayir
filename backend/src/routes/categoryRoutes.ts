import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { categoryValidator } from '../validators/categoryValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories as a nested tree (or flat list with ?flat=true)
 *     parameters:
 *       - in: query
 *         name: flat
 *         schema: { type: boolean }
 *       - in: query
 *         name: includeInactive
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Category list }
 *   post:
 *     tags: [Categories]
 *     summary: Create a category or subcategory (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               parent_id: { type: integer, nullable: true }
 *               description: { type: string }
 *               icon: { type: string }
 *               image: { type: string }
 *               is_active: { type: boolean }
 *               sort_order: { type: integer }
 *     responses:
 *       201: { description: Created }
 */
router.get('/', categoryController.listCategories);
router.post('/', authenticate, requireRole('admin'), categoryValidator, validateRequest, categoryController.createCategory);

/**
 * @openapi
 * /api/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by slug (includes direct subcategories)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category }
 *       404: { description: Not found }
 */
router.get('/:slug', categoryController.getCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.put('/:id', authenticate, requireRole('admin'), categoryValidator, validateRequest, categoryController.updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), categoryController.deleteCategory);

export default router;
