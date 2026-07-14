import { body } from 'express-validator';

export const checkoutValidator = [
  body('shipping_address_id').isInt().withMessage('shipping_address_id is required'),
  body('payment_method').isIn(['tap', 'deema', 'taly', 'cod']).withMessage('Invalid payment_method'),
  body('coupon_code').optional().isString()
];

export const orderStatusValidator = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  body('tracking_number').optional().isString()
];
