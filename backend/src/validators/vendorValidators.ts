import { body } from 'express-validator';

export const updateVendorProfileValidator = [
  body('store_name').optional().trim().notEmpty(),
  body('store_name_ar').optional({ nullable: true }).isString(),
  body('description').optional().isString(),
  body('description_ar').optional({ nullable: true }).isString(),
  body('business_type').optional().isString(),
  body('tax_number').optional().isString(),
  body('registration_number').optional().isString(),
  body('iban').optional().isString(),
  body('store_logo').optional().isString(),
  body('store_banner').optional().isString()
];

export const vendorStatusValidator = [
  body('status').isIn(['pending', 'approved', 'suspended', 'rejected']).withMessage('Invalid status'),
  body('rejection_reason').optional().isString()
];

export const commissionValidator = [
  body('commission_rate').isFloat({ min: 0, max: 100 }).withMessage('commission_rate must be between 0 and 100')
];

export const adminUpdateVendorValidator = [
  body('owner_name').optional().trim().notEmpty(),
  body('store_name').optional().trim().notEmpty(),
  body('store_name_ar').optional({ nullable: true }).isString(),
  body('description').optional({ nullable: true }).isString(),
  body('description_ar').optional({ nullable: true }).isString(),
  body('business_type').optional({ nullable: true }).isString(),
  body('tax_number').optional({ nullable: true }).isString(),
  body('registration_number').optional({ nullable: true }).isString(),
  body('iban').optional({ nullable: true }).isString(),
  body('category_id').optional({ nullable: true }).isInt().withMessage('category_id must be an integer'),
  body('category_ids').optional().isArray().withMessage('category_ids must be an array'),
  body('category_ids.*').optional().isInt().withMessage('Each category id must be an integer'),
  body('business_license_url').optional({ nullable: true }).isString(),
  body('store_logo').optional({ nullable: true }).isString(),
  body('is_featured').optional().isBoolean(),
  body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('commission_rate must be between 0 and 100')
];

export const adminCreateVendorValidator = [
  body('owner_name').trim().notEmpty().withMessage('Owner name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('store_name').trim().notEmpty().withMessage('Vendor English name is required'),
  body('store_name_ar').optional({ nullable: true }).isString(),
  body('iban').optional({ nullable: true }).isString(),
  body('category_id').optional({ nullable: true }).isInt().withMessage('category_id must be an integer'),
  body('category_ids').optional().isArray().withMessage('category_ids must be an array'),
  body('category_ids.*').optional().isInt().withMessage('Each category id must be an integer'),
  body('business_license_url').optional({ nullable: true }).isString(),
  body('store_logo').optional({ nullable: true }).isString(),
  body('is_featured').optional().isBoolean(),
  body('commission_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('commission_rate must be between 0 and 100')
];
