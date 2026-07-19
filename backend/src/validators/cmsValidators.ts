import { body } from 'express-validator';

export const updatePageValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('body').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('meta_description').optional({ nullable: true }).isString()
];
