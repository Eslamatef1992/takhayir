import { body } from 'express-validator';

export const updateVendorProfileValidator = [
  body('store_name').optional().trim().notEmpty(),
  body('description').optional().isString(),
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
