import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { validateRequest, validateObjectId } from '../middleware/validation';

const router = Router();

// Validation rules
const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Project name must be between 2 and 60 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .isIn(['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red', 'amber'])
    .withMessage('Invalid color value'),
];

const updateProjectValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ min: 2, max: 60 })
    .withMessage('Project name must be between 2 and 60 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .isIn(['blue', 'green', 'purple', 'orange', 'pink', 'teal', 'red', 'amber'])
    .withMessage('Invalid color value'),
];

// Routes
router.get('/', getAllProjects);
router.get('/:id', validateObjectId('id'), getProject);
router.post('/', createProjectValidation, validateRequest, createProject);
router.patch('/:id', validateObjectId('id'), updateProjectValidation, validateRequest, updateProject);
router.delete('/:id', validateObjectId('id'), deleteProject);

export default router;
