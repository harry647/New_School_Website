import { body, param } from 'express-validator';

export const clubEventValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required'),
  body('date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),
  body('description')
    .trim()
    .notEmpty().withMessage('Event description is required')
];

export const assignmentValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Assignment title is required'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be in YYYY-MM-DD format'),
  body('content')
    .trim()
    .notEmpty().withMessage('Assignment content is required')
];

export const paramIdValidator = [
  param('id')
    .notEmpty().withMessage('ID parameter is required')
    .isInt().withMessage('ID must be a number')
];
