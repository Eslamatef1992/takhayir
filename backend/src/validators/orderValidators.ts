import { body } from 'express-validator';

export const checkoutValidator = [
  body('shipping_address_id').isInt().withMessage('shipping_address_id is required'),
  body('payment_method').isIn(['tap', 'deema', 'taly', 'cod']).withMessage('Invalid payment_method'),
  body('coupon_code').optional().isString()
];

export const guestCheckoutValidator = [
  body('items').isArray({ min: 1 }).withMessage('Your cart is empty'),
  body('items.*.product_id').isInt().withMessage('Invalid product in cart'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Invalid quantity'),
  body('items.*.variant_id').optional({ nullable: true }).isInt(),
  body('guest.full_name').trim().notEmpty().withMessage('Full name is required'),
  body('guest.email').isEmail().withMessage('A valid email is required'),
  body('guest.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('shipping.country').trim().notEmpty().withMessage('Country is required'),
  body('shipping.city').trim().notEmpty().withMessage('City is required'),
  body('shipping.area').optional({ nullable: true }).isString(),
  body('shipping.street').optional({ nullable: true }).isString(),
  body('shipping.building').optional({ nullable: true }).isString(),
  body('shipping.notes').optional({ nullable: true }).isString(),
  body('payment_method').isIn(['tap', 'deema', 'taly', 'cod']).withMessage('Invalid payment_method'),
  body('coupon_code').optional().isString()
];

export const orderStatusValidator = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  body('tracking_number').optional().isString()
];

export const adminOrderStatusValidator = [
  body('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  body('payment_status').optional().isIn(['unpaid', 'paid', 'failed', 'refunded']).withMessage('Invalid payment_status')
];
