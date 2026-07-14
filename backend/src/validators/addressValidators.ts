import { body } from 'express-validator';

export const addressValidator = [
  body('full_name').trim().notEmpty(),
  body('phone').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('area').optional().isString(),
  body('street').optional().isString(),
  body('building').optional().isString(),
  body('label').optional().isString(),
  body('notes').optional().isString(),
  body('is_default').optional().isBoolean()
];
