const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisor.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createSupervisorSchema,
  updateSupervisorSchema,
  listSupervisorsSchema,
  supervisorIdParamSchema,
} = require('../validators/supervisor.validator');

// All routes require super_admin, manager, or operations
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

// Stats
router.get('/stats', supervisorController.getStats);

// CRUD
router.get('/', validate(listSupervisorsSchema, 'query'), supervisorController.list);
router.post('/', validate(createSupervisorSchema), supervisorController.create);
router.get('/:id', validate(supervisorIdParamSchema, 'params'), supervisorController.getById);
router.put('/:id', validate(supervisorIdParamSchema, 'params'), validate(updateSupervisorSchema), supervisorController.update);
router.patch('/:id/deactivate', validate(supervisorIdParamSchema, 'params'), supervisorController.deactivate);
router.patch('/:id/verify', validate(supervisorIdParamSchema, 'params'), supervisorController.verify);
router.delete('/:id', validate(supervisorIdParamSchema, 'params'), supervisorController.delete);

// Supervisor-specific
router.get('/:id/cleaners', validate(supervisorIdParamSchema, 'params'), supervisorController.getCleaners);

// Custom Allocations & Work approvals
router.post('/:id/allocate-apartment', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateApartment);
router.post('/:id/allocate-cleaner', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateCleaner);
router.post('/:id/allocate-qr', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateQr);
router.post('/:id/approve-work', validate(supervisorIdParamSchema, 'params'), supervisorController.approveWork);
router.post('/:id/reject-work', validate(supervisorIdParamSchema, 'params'), supervisorController.rejectWork);

module.exports = router;
