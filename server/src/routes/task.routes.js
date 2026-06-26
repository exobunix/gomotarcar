const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createTaskSchema, assignCleanerSchema, reassignSchema,
  completeTaskSchema, markMissedSchema, autoAssignSchema,
  getAvailabilitySchema, listTasksSchema,
  taskIdParamSchema, taskStrIdParamSchema, cleanerIdParamSchema,
} = require('../validators/task.validator');

router.use(authenticate);

// Stats
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), taskController.getStats);

// Assignment operations
router.post('/auto-assign', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(autoAssignSchema), taskController.autoAssign);
router.get('/availability', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(getAvailabilitySchema, 'query'), taskController.getAvailability);

// CRUD
router.get('/', validate(listTasksSchema, 'query'), taskController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(createTaskSchema), taskController.create);
router.get('/:id', validate(taskIdParamSchema, 'params'), taskController.getById);
router.get('/by-task/:taskId', taskController.getByTaskId);
router.get('/cleaner/:cleanerId/today', validate(cleanerIdParamSchema, 'params'), taskController.getTodayTasks);

// Assignment
router.patch('/:id/assign', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(taskIdParamSchema, 'params'), validate(assignCleanerSchema), taskController.assignCleaner);
router.patch('/:id/reassign', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(taskIdParamSchema, 'params'), validate(reassignSchema), taskController.reassign);

// Status transitions (cleaner)
router.patch('/:id/start', authorize(roles.CLEANER, roles.SUPERVISOR), validate(taskIdParamSchema, 'params'), taskController.startTask);
router.patch('/:id/complete', authorize(roles.CLEANER, roles.SUPERVISOR), validate(taskIdParamSchema, 'params'), validate(completeTaskSchema), taskController.completeTask);
router.patch('/:id/miss', authorize(roles.SUPERVISOR, roles.MANAGER), validate(taskIdParamSchema, 'params'), validate(markMissedSchema), taskController.markMissed);

// Earnings
router.post('/:id/record-earnings', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(taskIdParamSchema, 'params'), taskController.recordEarnings);

module.exports = router;
