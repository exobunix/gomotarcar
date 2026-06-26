const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  applyLeaveSchema, rejectLeaveSchema, listLeaveSchema,
  leaveIdParamSchema, cleanerBalanceParamSchema,
} = require('../validators/leave.validator');

router.use(authenticate);

// Cleaner routes
router.post('/', authorize(roles.CLEANER, roles.SUPERVISOR, roles.MANAGER), validate(applyLeaveSchema), leaveController.apply);
router.get('/balance/:cleanerId', validate(cleanerBalanceParamSchema, 'params'), leaveController.getBalance);

// Admin routes
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS), validate(listLeaveSchema, 'query'), leaveController.list);
router.get('/:id', validate(leaveIdParamSchema, 'params'), leaveController.getById);
router.patch('/:id/approve', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(leaveIdParamSchema, 'params'), leaveController.approve);
router.patch('/:id/reject', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(leaveIdParamSchema, 'params'), validate(rejectLeaveSchema), leaveController.reject);

// Stats
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), leaveController.getStats);

module.exports = router;
