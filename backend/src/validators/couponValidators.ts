import { body } from 'express-validator';

export const couponValidator = [
  body('code').trim().notEmpty().withMessage('code is required'),
  body('type').isIn(['fixed', 'percent']).withMessage('type must be fixed or percent'),
  body('value').isFloat({ min: 0 }).withMessage('value must be positive'),
  body('min_order_amount').optional().isFloat({ min: 0 }),
  body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }),
  body('starts_at').optional({ nullable: true }).isISO8601(),
  body('expires_at').optional({ nullable: true }).isISO8601(),
  body('is_active').optional().isBoolean()
];
