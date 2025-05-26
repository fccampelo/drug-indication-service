import { body, param, query } from 'express-validator';

export const validateCreateDrugIndication = [
  body('drug')
    .notEmpty()
    .withMessage('Drug name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Drug name must be between 2 and 100 characters'),

  body('sourceUrl')
    .notEmpty()
    .withMessage('Source URL is required')
    .isURL()
    .withMessage('Source URL must be a valid URL'),

  body('extractedSection')
    .notEmpty()
    .withMessage('Extracted section is required')
    .isLength({ min: 10 })
    .withMessage('Extracted section must be at least 10 characters'),

  body('indication')
    .notEmpty()
    .withMessage('Indication is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Indication must be between 2 and 200 characters'),

  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  body('synonyms')
    .optional()
    .isArray()
    .withMessage('Synonyms must be an array'),

  body('synonyms.*')
    .optional()
    .isString()
    .withMessage('Each synonym must be a string'),

  body('icd10Codes')
    .isArray({ min: 1 })
    .withMessage('At least one ICD-10 code is required'),

  body('icd10Codes.*')
    .matches(/^[A-Z]\d{2}(\.\d{1,2})?$/)
    .withMessage('Each ICD-10 code must be in valid format (e.g., L20.9, J45.909)'),

  body('ageRange')
    .notEmpty()
    .withMessage('Age range is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Age range must be between 2 and 50 characters'),

  body('limitations')
    .optional()
    .isString()
    .withMessage('Limitations must be a string'),

  body('mappingStatus')
    .optional()
    .isIn(['mapped', 'unmapped', 'pending', 'review'])
    .withMessage('Mapping status must be one of: mapped, unmapped, pending, review'),

  body('mappingNotes')
    .optional()
    .isString()
    .withMessage('Mapping notes must be a string'),
];

export const validateUpdateDrugIndication = [
  body('drug')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Drug name must be between 2 and 100 characters'),

  body('sourceUrl')
    .optional()
    .isURL()
    .withMessage('Source URL must be a valid URL'),

  body('extractedSection')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Extracted section must be at least 10 characters'),

  body('indication')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Indication must be between 2 and 200 characters'),

  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  body('synonyms')
    .optional()
    .isArray()
    .withMessage('Synonyms must be an array'),

  body('synonyms.*')
    .optional()
    .isString()
    .withMessage('Each synonym must be a string'),

  body('icd10Codes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one ICD-10 code is required'),

  body('icd10Codes.*')
    .optional()
    .matches(/^[A-Z]\d{2}(\.\d{1,2})?$/)
    .withMessage('Each ICD-10 code must be in valid format (e.g., L20.9, J45.909)'),

  body('ageRange')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Age range must be between 2 and 50 characters'),

  body('limitations')
    .optional()
    .isString()
    .withMessage('Limitations must be a string'),

  body('mappingStatus')
    .optional()
    .isIn(['mapped', 'unmapped', 'pending', 'review'])
    .withMessage('Mapping status must be one of: mapped, unmapped, pending, review'),

  body('mappingNotes')
    .optional()
    .isString()
    .withMessage('Mapping notes must be a string'),
];

export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

export const validateDrugName = [
  param('drugName')
    .notEmpty()
    .withMessage('Drug name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Drug name must be between 2 and 100 characters'),
];

export const validateICD10Code = [
  param('code')
    .matches(/^[A-Z]\d{2}(\.\d{1,2})?$/)
    .withMessage('ICD-10 code must be in valid format (e.g., L20.9, J45.909)'),
];

export const validateSearchQuery = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
];

export const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('drug')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Drug filter must be at least 2 characters'),

  query('indication')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Indication filter must be at least 2 characters'),

  query('mappingStatus')
    .optional()
    .isIn(['mapped', 'unmapped', 'pending', 'review'])
    .withMessage('Mapping status must be one of: mapped, unmapped, pending, review'),

  query('icd10Code')
    .optional()
    .matches(/^[A-Z]\d{2}(\.\d{1,2})?$/)
    .withMessage('ICD-10 code must be in valid format (e.g., L20.9, J45.909)'),
]; 