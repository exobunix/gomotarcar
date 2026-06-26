const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createPackageSchema, updatePackageSchema, subscribeSchema,
  cancelSubscriptionSchema, listSubscriptionsSchema, listPackagesSchema,
  subscriptionIdParamSchema, updateSubscriptionSchema
} = require('../validators/subscription.validator');

router.use(authenticate);

// Package management (admin)
router.get('/packages', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS, roles.CUSTOMER), validate(listPackagesSchema, 'query'), subscriptionController.listPackages);
router.post('/packages', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(createPackageSchema), subscriptionController.createPackage);
router.put('/packages/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(subscriptionIdParamSchema, 'params'), validate(updatePackageSchema), subscriptionController.updatePackage);

// Subscription management
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), subscriptionController.getStats);
router.get('/', validate(listSubscriptionsSchema, 'query'), subscriptionController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.CUSTOMER), validate(subscribeSchema), subscriptionController.subscribe);
router.get('/:id', validate(subscriptionIdParamSchema, 'params'), subscriptionController.getById);
router.patch('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(subscriptionIdParamSchema, 'params'), validate(updateSubscriptionSchema), subscriptionController.updateSubscription);
router.patch('/:id/cancel', validate(subscriptionIdParamSchema, 'params'), validate(cancelSubscriptionSchema), subscriptionController.cancel);
router.patch('/:id/use-cleaning', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(subscriptionIdParamSchema, 'params'), subscriptionController.useCleaning);

module.exports = router;
