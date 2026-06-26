const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createLeadSchema, updateLeadStatusSchema, assignLeadSchema,
  listLeadsSchema, leadIdParamSchema,
} = require('../validators/lead.validator');

router.use(authenticate);

// Public/customer routes
router.post('/', authorize(roles.CUSTOMER, roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(createLeadSchema), leadController.create);

// Lead management routes
router.get('/analytics', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), leadController.getAnalytics);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listLeadsSchema, 'query'), leadController.list);
router.get('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(leadIdParamSchema, 'params'), leadController.getById);
router.patch('/:id/status', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(leadIdParamSchema, 'params'), validate(updateLeadStatusSchema), leadController.updateStatus);
router.patch('/:id/assign', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(leadIdParamSchema, 'params'), validate(assignLeadSchema), leadController.assign);
router.post('/:id/convert', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(leadIdParamSchema, 'params'), leadController.convert);

module.exports = router;
