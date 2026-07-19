import { body } from 'express-validator';

export const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('parent_id').optional({ nullable: true }).isInt().withMessage('parent_id must be an integer'),
  body('description').optional().isString(),
  body('icon').optional().isString(),
  body('image').optional().isString(),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt()
];

// Used for PUT /categories/:id, where a partial update (e.g. just setting
// the tile image) must not be forced to also resend `name`.
export const updateCategoryValidator = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('parent_id').optional({ nullable: true }).isInt().withMessage('parent_id must be an integer'),
  body('description').optional().isString(),
  body('icon').optional().isString(),
  body('image').optional({ nullable: true }).isString(),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt()
];
