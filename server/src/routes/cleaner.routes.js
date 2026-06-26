const express = require('express');
const router = express.Router();
const cleanerController = require('../controllers/cleaner.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createCleanerSchema,
  updateCleanerSchema,
  listCleanersSchema,
  cleanerIdParamSchema,
  updateStatsSchema,
  updateDocStatusSchema,
} = require('../validators/cleaner.validator');

// All routes require admin/supervisor roles
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS, roles.FRANCHISE));

// Stats
router.get('/stats', cleanerController.getStats);

// CRUD
router.get('/', validate(listCleanersSchema, 'query'), cleanerController.list);
router.post('/', validate(createCleanerSchema), cleanerController.create);
router.get('/:id', validate(cleanerIdParamSchema, 'params'), cleanerController.getById);
router.put('/:id', validate(cleanerIdParamSchema, 'params'), validate(updateCleanerSchema), cleanerController.update);
router.patch('/:id/stats', validate(cleanerIdParamSchema, 'params'), validate(updateStatsSchema), cleanerController.updateStats);
router.patch('/:id/document-status', validate(cleanerIdParamSchema, 'params'), validate(updateDocStatusSchema), cleanerController.updateDocumentStatus);
router.patch('/:id/verify', validate(cleanerIdParamSchema, 'params'), cleanerController.verify);
router.patch('/:id/deactivate', validate(cleanerIdParamSchema, 'params'), cleanerController.deactivate);
router.delete('/:id', validate(cleanerIdParamSchema, 'params'), cleanerController.delete);

module.exports = router;
