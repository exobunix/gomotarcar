const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createVehicleSchema,
  updateVehicleSchema,
  listVehiclesSchema,
  vehicleIdParamSchema,
  customerIdParamSchema,
} = require('../validators/vehicle.validator');

// Public routes (customer-facing)
router.post('/', authenticate, validate(createVehicleSchema), vehicleController.create);
router.get('/customer/:customerId', authenticate, validate(customerIdParamSchema, 'params'), vehicleController.listByCustomer);

// Protected routes (admin/staff)
router.get('/', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listVehiclesSchema, 'query'), vehicleController.list);
router.get('/stats', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), vehicleController.getStats);
router.get('/number/:vehicleNumber', authenticate, vehicleController.getByNumber);
router.get('/:id', authenticate, validate(vehicleIdParamSchema, 'params'), vehicleController.getById);
router.put('/:id', authenticate, validate(vehicleIdParamSchema, 'params'), validate(updateVehicleSchema), vehicleController.update);
router.patch('/:id/deactivate', authenticate, validate(vehicleIdParamSchema, 'params'), vehicleController.deactivate);
router.delete('/:id', authenticate, validate(vehicleIdParamSchema, 'params'), vehicleController.delete);

module.exports = router;
