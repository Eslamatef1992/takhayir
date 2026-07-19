import { Router } from 'express';
import * as adminUserController from '../controllers/adminUserController';
import { createAdminValidator, updateAdminValidator } from '../validators/adminUserValidators';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/auth';
import { requireRole, gateAdminRole } from '../middleware/roles';

const router = Router();

// Every route here is Super Admin only — gateAdminRole('admins') is applied
// to reads as well as writes, since the list of admin accounts (and their
// emails) is itself sensitive, not just the ability to edit them.
router.use(authenticate, requireRole('admin'), gateAdminRole('admins'));

/**
 * @openapi
 * /api/admin-users:
 *   get:
 *     tags: [Admin Users]
 *     summary: List all admin accounts (Super Admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin account list }
 *   post:
 *     tags: [Admin Users]
 *     summary: Create a new admin account with a fixed role preset (Super Admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, email, password, admin_role]
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               admin_role: { type: string, enum: [super_admin, orders_manager, product_manager, support] }
 *     responses:
 *       201: { description: Created }
 */
router.get('/', adminUserController.listAdmins);
router.post('/', createAdminValidator, validateRequest, adminUserController.createAdmin);

/**
 * @openapi
 * /api/admin-users/{id}:
 *   put:
 *     tags: [Admin Users]
 *     summary: Edit an admin account or reassign its role (Super Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     tags: [Admin Users]
 *     summary: Remove an admin account (Super Admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 */
router.put('/:id', updateAdminValidator, validateRequest, adminUserController.updateAdmin);
router.delete('/:id', adminUserController.deleteAdmin);

export default router;
