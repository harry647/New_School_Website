import { body } from 'express-validator';

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/).withMessage('Password must include uppercase, lowercase, number, and special character'),

  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(['student', 'teacher', 'admin']).withMessage('Role must be either student, teacher, or admin'),

  body('securityQuestion1')
    .trim()
    .notEmpty().withMessage('Security question 1 is required'),

  body('securityAnswer1')
    .trim()
    .notEmpty().withMessage('Security answer 1 is required'),

  body('securityQuestion2')
    .trim()
    .notEmpty().withMessage('Security question 2 is required'),

  body('securityAnswer2')
    .trim()
    .notEmpty().withMessage('Security answer 2 is required')
];
