import { body } from 'express-validator';

export const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('price must be a positive number'),
  body('category_id').optional({ nullable: true }).isInt(),
  body('name_ar').optional({ nullable: true }).isString(),
  body('description').optional().isString(),
  body('description_ar').optional({ nullable: true }).isString(),
  body('sku').optional().isString(),
  body('compare_at_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('weight_kg').optional({ nullable: true }).isFloat({ min: 0 }),
  body('images').optional().isArray(),
  body('variants').optional().isArray(),
  body('attributes').optional({ nullable: true }).isObject()
];

export const updateProductValidator = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('category_id').optional({ nullable: true }).isInt(),
  body('name_ar').optional({ nullable: true }).isString(),
  body('description').optional().isString(),
  body('description_ar').optional({ nullable: true }).isString(),
  body('sku').optional().isString(),
  body('compare_at_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('weight_kg').optional({ nullable: true }).isFloat({ min: 0 }),
  body('variants').optional().isArray(),
  body('attributes').optional({ nullable: true }).isObject()
];

export const adminCreateProductValidator = [
  body('vendor_id').isInt().withMessage('vendor_id is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('price must be a positive number'),
  body('category_id').optional({ nullable: true }).isInt(),
  body('name_ar').optional({ nullable: true }).isString(),
  body('description').optional().isString(),
  body('description_ar').optional({ nullable: true }).isString(),
  body('sku').optional().isString(),
  body('compare_at_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('weight_kg').optional({ nullable: true }).isFloat({ min: 0 }),
  body('status').optional().isIn(['draft', 'pending', 'active', 'rejected', 'archived']),
  body('images').optional().isArray(),
  body('variants').optional().isArray(),
  body('attributes').optional({ nullable: true }).isObject()
];

export const productStatusValidator = [
  body('status').isIn(['pending', 'active', 'rejected', 'archived']).withMessage('Invalid status'),
  body('rejection_reason').optional().isString()
];
