const express = require('express');
const router = express.Router();
const ncspController = require('../controllers/ncsp.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createNcspPartnerSchema,
  updateNcspPartnerSchema,
  listNcspPartnersSchema,
  ncspPartnerIdParamSchema,
} = require('../validators/ncsp.validator');

// All routes require authentication and manager/admin roles
router.use(authenticate);

router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), ncspController.getStats);

router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listNcspPartnersSchema, 'query'), ncspController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(createNcspPartnerSchema), ncspController.create);

router.get('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(ncspPartnerIdParamSchema, 'params'), ncspController.getById);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(ncspPartnerIdParamSchema, 'params'), validate(updateNcspPartnerSchema), ncspController.update);

router.patch('/:id/deactivate', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(ncspPartnerIdParamSchema, 'params'), ncspController.deactivate);
router.patch('/:id/verify', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(ncspPartnerIdParamSchema, 'params'), ncspController.verify);

router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(ncspPartnerIdParamSchema, 'params'), ncspController.delete);

module.exports = router;
