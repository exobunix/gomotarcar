const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const Joi = require('joi');

const bookingIdParamSchema = Joi.object({
  bookingId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

const listInvoicesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  customerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  franchiseId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
});

router.use(authenticate);

// Generate invoice for completed booking
router.post('/generate/:bookingId', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.FRANCHISE), validate(bookingIdParamSchema, 'params'), invoiceController.generate);

// Get invoice by booking ID
router.get('/booking/:bookingId', validate(bookingIdParamSchema, 'params'), invoiceController.getByBookingId);

// List invoices (admin)
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), validate(listInvoicesSchema, 'query'), invoiceController.list);

module.exports = router;
