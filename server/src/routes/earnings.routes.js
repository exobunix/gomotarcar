const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earnings.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  calculatePeriodSchema, listEarningsSchema,
  earningsIdParamSchema, taskIdParamSchema, cleanerSummaryParamSchema,
} = require('../validators/earnings.validator');

router.use(authenticate);

// Stats
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), earningsController.getStats);

// CRUD
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(listEarningsSchema, 'query'), earningsController.list);
router.post('/calculate-period', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(calculatePeriodSchema), earningsController.calculatePeriodEarnings);
router.post('/task/:taskId', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(taskIdParamSchema, 'params'), earningsController.recordTaskEarnings);
router.get('/:id', validate(earningsIdParamSchema, 'params'), earningsController.getById);
router.get('/cleaner/:cleanerId/summary', validate(cleanerSummaryParamSchema, 'params'), earningsController.getCleanerSummary);

module.exports = router;
