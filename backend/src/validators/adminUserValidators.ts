import { body } from 'express-validator';

const ADMIN_ROLES = ['super_admin', 'orders_manager', 'product_manager', 'support'];

export const createAdminValidator = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').optional({ nullable: true }).isString(),
  body('email').isEmail().withMessage('A valid email is required'),
  body('phone').optional({ nullable: true }).isString(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('admin_role').isIn(ADMIN_ROLES).withMessage('Invalid admin role')
];

export const updateAdminValidator = [
  body('first_name').optional().trim().notEmpty(),
  body('last_name').optional({ nullable: true }).isString(),
  body('phone').optional({ nullable: true }).isString(),
  body('admin_role').optional().isIn(ADMIN_ROLES).withMessage('Invalid admin role'),
  body('status').optional().isIn(['active', 'suspended']),
  body('password').optional({ nullable: true }).isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
