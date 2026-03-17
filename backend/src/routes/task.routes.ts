import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as taskController from '../controllers/task.controller';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /tasks - list with pagination, filtering, search
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Invalid status value'),
    query('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Invalid priority value'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'dueDate', 'title'])
      .withMessage('Invalid sortBy value'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Invalid sortOrder value'),
  ],
  validate,
  taskController.getTasks
);

// GET /tasks/stats
router.get('/stats', taskController.getTaskStats);

// GET /tasks/:id
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Task ID is required')],
  validate,
  taskController.getTask
);

// POST /tasks
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 255 })
      .withMessage('Title must be under 255 characters'),
    body('description').optional().isString().isLength({ max: 5000 }),
    body('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ],
  validate,
  taskController.createTask
);

// PATCH /tasks/:id
router.patch(
  '/:id',
  [
    param('id').notEmpty().withMessage('Task ID is required'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 255 }),
    body('description').optional().isString().isLength({ max: 5000 }),
    body('status')
      .optional()
      .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['LOW', 'MEDIUM', 'HIGH'])
      .withMessage('Invalid priority'),
    body('dueDate')
      .optional({ nullable: true })
      .custom((value) => value === null || value === '' || !isNaN(Date.parse(value)))
      .withMessage('Invalid date format'),
  ],
  validate,
  taskController.updateTask
);

// DELETE /tasks/:id
router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('Task ID is required')],
  validate,
  taskController.deleteTask
);

// PATCH /tasks/:id/toggle
router.patch(
  '/:id/toggle',
  [param('id').notEmpty().withMessage('Task ID is required')],
  validate,
  taskController.toggleTask
);

export default router;
