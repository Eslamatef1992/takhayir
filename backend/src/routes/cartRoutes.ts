import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { addToCartValidator, updateCartItemValidator } from '../validators/cartValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get my cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cart contents }
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to my cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Item added }
 *   delete:
 *     tags: [Cart]
 *     summary: Clear my cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Cleared }
 */
router.get('/', authenticate, cartController.getMyCart);
router.post('/', authenticate, addToCartValidator, validateRequest, cartController.addToCart);
router.delete('/', authenticate, cartController.clearCart);

/**
 * @openapi
 * /api/cart/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from my cart
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Removed }
 */
router.put('/:itemId', authenticate, updateCartItemValidator, validateRequest, cartController.updateCartItem);
router.delete('/:itemId', authenticate, cartController.removeCartItem);

export default router;
