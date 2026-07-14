import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';

const router = Router();

/**
 * @openapi
 * /api/dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Platform-wide stats for the admin dashboard
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats }
 */
router.get('/admin', authenticate, requireRole('admin'), dashboardController.adminDashboard);

/**
 * @openapi
 * /api/dashboard/vendor:
 *   get:
 *     tags: [Dashboard]
 *     summary: My store's stats for the vendor dashboard
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stats }
 */
router.get('/vendor', authenticate, requireRole('vendor'), dashboardController.vendorDashboard);

export default router;
