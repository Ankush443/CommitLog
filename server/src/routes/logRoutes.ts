import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllLogs,
  getLog,
  createLog,
  updateLog,
  deleteLog,
  getActivity,
} from '../controllers/logController';
import { getWeeklyRecap } from '../utils/recapCalculator';
import { validateRequest, validateObjectId } from '../middleware/validation';

const router = Router();

// Validation rules
const createLogValidation = [
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('completed')
    .trim()
    .notEmpty()
    .withMessage('Completed work is required')
    .isLength({ max: 2000 })
    .withMessage('Completed work cannot exceed 2000 characters'),
  body('blockers')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Blockers cannot exceed 2000 characters'),
  body('nextSteps')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Next steps cannot exceed 2000 characters'),
  body('projectId')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage('Invalid project ID format'),
  body('repositoryUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/.+/)
    .withMessage('Repository URL must be a valid HTTP or HTTPS URL'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
];

const updateLogValidation = [
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('completed')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Completed work cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Completed work cannot exceed 2000 characters'),
  body('blockers')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Blockers cannot exceed 2000 characters'),
  body('nextSteps')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Next steps cannot exceed 2000 characters'),
  body('projectId')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      return /^[0-9a-fA-F]{24}$/.test(value);
    })
    .withMessage('Invalid project ID format'),
  body('repositoryUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage('Repository URL must be a valid HTTP or HTTPS URL'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
];

// Routes
router.get('/', getAllLogs);
router.get('/activity', getActivity); // Must be before /:id to avoid conflict
router.get('/recap', getWeeklyRecap);
router.get('/:id', validateObjectId('id'), getLog);
router.post('/', createLogValidation, validateRequest, createLog);
router.patch('/:id', validateObjectId('id'), updateLogValidation, validateRequest, updateLog);
router.delete('/:id', validateObjectId('id'), deleteLog);

export default router;
