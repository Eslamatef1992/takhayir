import { body } from 'express-validator';

export const variantTypeValidator = [body('name').trim().notEmpty().withMessage('Name is required')];

export const variantValueValidator = [body('value').trim().notEmpty().withMessage('Value is required')];
