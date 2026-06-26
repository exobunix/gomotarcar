const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartment.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createApartmentSchema,
  updateApartmentSchema,
  apartmentIdParamSchema,
  listApartmentsSchema,
  customerIdParamSchema,
} = require('../validators/apartment.validator');

// Public routes (customer-facing)
router.post('/', authenticate, validate(createApartmentSchema), apartmentController.create);
router.get('/customer/:customerId', authenticate, validate(customerIdParamSchema, 'params'), apartmentController.listByCustomer);

// Protected routes (admin/staff)
router.get('/', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listApartmentsSchema, 'query'), apartmentController.list);
router.get('/:id', authenticate, validate(apartmentIdParamSchema, 'params'), apartmentController.getById);
router.put('/:id', authenticate, validate(apartmentIdParamSchema, 'params'), validate(updateApartmentSchema), apartmentController.update);
router.patch('/:id/default', authenticate, validate(apartmentIdParamSchema, 'params'), apartmentController.setDefault);
router.delete('/:id', authenticate, validate(apartmentIdParamSchema, 'params'), apartmentController.delete);

module.exports = router;
