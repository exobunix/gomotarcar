const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createAdminSchema,
  updateAdminSchema,
  updatePermissionsSchema,
  adminIdParamSchema,
  listAdminsSchema,
} = require('../validators/admin.validator');

// All routes require super_admin or manager role
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER));

// Stats
router.get('/stats', adminController.getStats);

// CRUD
router.get('/', validate(listAdminsSchema, 'query'), adminController.list);
router.post('/', validate(createAdminSchema), adminController.create);
router.get('/:id', validate(adminIdParamSchema, 'params'), adminController.getById);
router.put('/:id', validate(adminIdParamSchema, 'params'), validate(updateAdminSchema), adminController.update);
router.patch('/:id/permissions', validate(adminIdParamSchema, 'params'), validate(updatePermissionsSchema), adminController.updatePermissions);
router.patch('/:id/deactivate', validate(adminIdParamSchema, 'params'), adminController.deactivate);
router.delete('/:id', validate(adminIdParamSchema, 'params'), adminController.delete);

module.exports = router;
