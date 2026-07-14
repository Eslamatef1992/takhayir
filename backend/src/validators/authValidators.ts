import { body } from 'express-validator';

export const registerValidator = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isString(),
  body('role').optional().isIn(['customer', 'vendor']).withMessage('Role must be customer or vendor')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

export const vendorRegisterValidator = [
  ...registerValidator,
  body('store_name').trim().notEmpty().withMessage('Store name is required')
];
