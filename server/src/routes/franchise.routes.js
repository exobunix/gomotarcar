const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchise.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createFranchiseSchema,
  updateFranchiseSchema,
  verifyFranchiseSchema,
  listFranchisesSchema,
  franchiseIdParamSchema,
} = require('../validators/franchise.validator');

// All routes require admin roles
router.use(authenticate);
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS, roles.FRANCHISE), franchiseController.getStats);

// Admin CRUD
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listFranchisesSchema, 'query'), franchiseController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(createFranchiseSchema), franchiseController.create);
router.get('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS, roles.FRANCHISE), validate(franchiseIdParamSchema, 'params'), franchiseController.getById);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS, roles.FRANCHISE), validate(franchiseIdParamSchema, 'params'), validate(updateFranchiseSchema), franchiseController.update);
router.patch('/:id/verify', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(franchiseIdParamSchema, 'params'), validate(verifyFranchiseSchema), franchiseController.verify);
router.patch('/:id/deactivate', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(franchiseIdParamSchema, 'params'), franchiseController.deactivate);
router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(franchiseIdParamSchema, 'params'), franchiseController.delete);

module.exports = router;
