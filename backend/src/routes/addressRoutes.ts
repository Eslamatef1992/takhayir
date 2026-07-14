import { Router } from 'express';
import * as addressController from '../controllers/addressController';
import { addressValidator } from '../validators/addressValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/addresses:
 *   get:
 *     tags: [Addresses]
 *     summary: List my saved addresses
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Address list }
 *   post:
 *     tags: [Addresses]
 *     summary: Add a new address
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 */
router.get('/', authenticate, addressController.listMyAddresses);
router.post('/', authenticate, addressValidator, validateRequest, addressController.createAddress);

/**
 * @openapi
 * /api/addresses/{id}:
 *   put:
 *     tags: [Addresses]
 *     summary: Update an address
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Addresses]
 *     summary: Delete an address
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.put('/:id', authenticate, addressValidator, validateRequest, addressController.updateAddress);
router.delete('/:id', authenticate, addressController.deleteAddress);

export default router;
