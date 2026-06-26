const express = require('express');
const router = express.Router();
const fastTagController = require('../controllers/fasttag.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  rechargeSchema, confirmRechargeSchema, listTransactionsSchema,
  fastTagIdParamSchema, vehicleIdParamSchema,
} = require('../validators/fasttag.validator');

router.use(authenticate);

// Customer routes
router.post('/recharge', authorize(roles.CUSTOMER, roles.SUPER_ADMIN, roles.MANAGER), validate(rechargeSchema), fastTagController.recharge);
router.post('/confirm', authorize(roles.CUSTOMER, roles.SUPER_ADMIN, roles.MANAGER), validate(confirmRechargeSchema), fastTagController.confirm);
router.get('/balance/:vehicleId', validate(vehicleIdParamSchema, 'params'), fastTagController.getBalance);
router.get('/vehicle/:vehicleId/history', validate(vehicleIdParamSchema, 'params'), fastTagController.getVehicleHistory);

// Admin routes
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), fastTagController.getStats);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listTransactionsSchema, 'query'), fastTagController.list);
router.get('/:id', validate(fastTagIdParamSchema, 'params'), fastTagController.getById);

module.exports = router;
