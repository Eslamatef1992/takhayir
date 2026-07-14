import { body } from 'express-validator';

export const createBannerValidator = [
  body('image_url').trim().notEmpty().withMessage('image_url is required'),
  body('title').optional().isString(),
  body('subtitle').optional().isString(),
  body('link_url').optional().isString(),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt()
];

export const updateBannerValidator = [
  body('image_url').optional().isString(),
  body('title').optional().isString(),
  body('subtitle').optional().isString(),
  body('link_url').optional().isString(),
  body('is_active').optional().isBoolean(),
  body('sort_order').optional().isInt()
];
