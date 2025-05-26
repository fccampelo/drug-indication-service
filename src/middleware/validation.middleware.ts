import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
    });
    return;
  }

  next();
};

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('roles')
    .optional()
    .isArray()
    .withMessage('Roles must be an array')
    .custom((roles) => {
      const validRoles = ['admin', 'user'];
      if (roles && !roles.every((role: string) => validRoles.includes(role))) {
        throw new Error('Invalid role provided');
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateCreateDrugIndication = [
  body('drugName')
    .trim()
    .notEmpty()
    .withMessage('Drug name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Drug name must be between 2 and 100 characters'),
  body('labelUrl')
    .trim()
    .notEmpty()
    .withMessage('Label URL is required')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL'),
  handleValidationErrors,
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  handleValidationErrors,
];

export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];

export const validateDrugName = [
  param('drugName')
    .trim()
    .notEmpty()
    .withMessage('Drug name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Drug name must be between 2 and 100 characters'),
  handleValidationErrors,
];

export const validateICD10Code = [
  param('code')
    .trim()
    .notEmpty()
    .withMessage('ICD-10 code is required')
    .matches(/^[A-Z]\d{2}(\.\d{1,2})?$/)
    .withMessage('Invalid ICD-10 code format'),
  handleValidationErrors,
]; 