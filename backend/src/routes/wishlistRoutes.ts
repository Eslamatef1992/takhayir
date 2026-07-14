import { Router } from 'express';
import { body } from 'express-validator';
import * as wishlistController from '../controllers/wishlistController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: List my wishlist
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wishlist items }
 *   post:
 *     tags: [Wishlist]
 *     summary: Add a product to my wishlist
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Added }
 */
router.get('/', authenticate, wishlistController.listMyWishlist);
router.post('/', authenticate, [body('product_id').isInt()], validateRequest, wishlistController.addToWishlist);

/**
 * @openapi
 * /api/wishlist/{id}:
 *   delete:
 *     tags: [Wishlist]
 *     summary: Remove an item from my wishlist
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removed }
 */
router.delete('/:id', authenticate, wishlistController.removeFromWishlist);

export default router;
