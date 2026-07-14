import { body } from 'express-validator';

export const addToCartValidator = [
  body('product_id').isInt().withMessage('product_id is required'),
  body('variant_id').optional({ nullable: true }).isInt(),
  body('quantity').optional().isInt({ min: 1 })
];

export const updateCartItemValidator = [
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1')
];
