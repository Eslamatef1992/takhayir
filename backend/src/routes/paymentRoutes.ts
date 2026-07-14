import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';

const router = Router();

/**
 * @openapi
 * /api/payments/tap/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Tap Payments webhook (also receives Deema BNPL status updates)
 *     responses:
 *       200: { description: Acknowledged }
 */
router.post('/tap/webhook', paymentController.tapWebhook);

/**
 * @openapi
 * /api/payments/taly/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Taly BNPL webhook
 *     responses:
 *       200: { description: Acknowledged }
 */
router.post('/taly/webhook', paymentController.talyWebhook);

/**
 * @openapi
 * /api/payments/tap/redirect:
 *   get:
 *     tags: [Payments]
 *     summary: Redirect target after a Tap/Deema checkout attempt
 *     responses:
 *       302: { description: Redirects to the storefront order confirmation page }
 */
router.get('/tap/redirect', paymentController.paymentRedirect);

/**
 * @openapi
 * /api/payments/taly/redirect:
 *   get:
 *     tags: [Payments]
 *     summary: Redirect target after a Taly checkout attempt
 *     responses:
 *       302: { description: Redirects to the storefront order confirmation page }
 */
router.get('/taly/redirect', paymentController.paymentRedirect);

export default router;
