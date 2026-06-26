const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  updateCustomerSchema,
  addVehicleSchema,
  listCustomersSchema,
  customerIdParamSchema,
} = require('../validators/customer.validator');

router.use(authenticate);

// Customer-facing
router.get('/profile', customerController.getProfile);
router.put('/profile', validate(updateCustomerSchema), customerController.updateProfile);
router.get('/bookings', customerController.getMyBookings);
router.get('/vehicles', customerController.getMyVehicles);
router.post('/vehicles', validate(addVehicleSchema), customerController.addVehicle);

// Admin routes
router.get('/stats', authorize(roles.SUPER_ADMIN, roles.MANAGER), customerController.getStats);
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listCustomersSchema, 'query'), customerController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER), customerController.create);
router.get('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(customerIdParamSchema, 'params'), customerController.getById);
router.put('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(customerIdParamSchema, 'params'), validate(updateCustomerSchema), customerController.update);
router.patch('/:id/deactivate', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(customerIdParamSchema, 'params'), customerController.deactivate);

module.exports = router;
