import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { reviewValidator } from '../validators/reviewValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/reviews/product/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: List approved reviews for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Review list }
 */
router.get('/product/:productId', reviewController.listProductReviews);

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a product review (customer only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.post('/', authenticate, requireRole('customer'), reviewValidator, validateRequest, reviewController.createReview);

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete my review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.delete('/:id', authenticate, requireRole('customer'), reviewController.deleteReview);

export default router;
