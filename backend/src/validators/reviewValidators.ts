import { body } from 'express-validator';

export const reviewValidator = [
  body('product_id').isInt().withMessage('product_id is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
  body('comment').optional().isString(),
  body('order_item_id').optional({ nullable: true }).isInt()
];
