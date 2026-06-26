const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const Joi = require('joi');

// ─── Schemas ───
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const generateQRSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).optional(),
  customerId: Joi.string().pattern(objectIdPattern).optional(),
  name: Joi.string().max(100).optional(),
  purpose: Joi.string().max(100).optional(),
  type: Joi.string().valid('Booking', 'Feedback', 'Subscription', 'Service', 'Promotion', 'App Download', 'Partner', 'Event', 'Car').optional(),
  location: Joi.string().max(200).optional(),
});

const bulkGenerateSchema = Joi.object({
  vehicleIds: Joi.array().items(Joi.string().pattern(objectIdPattern)).optional(),
  customerId: Joi.string().pattern(objectIdPattern).optional(),
});

const scanQRSchema = Joi.object({
  code: Joi.string().required().messages({ 'any.required': 'QR code is required' }),
});

const reportDamagedSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
});

const replaceQRSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
});

const listQRSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending_activation', 'active', 'damaged', 'replaced', 'expired'),
  type: Joi.string().valid('Booking', 'Feedback', 'Subscription', 'Service', 'Promotion', 'App Download', 'Partner', 'Event', 'Car'),
  vehicleId: Joi.string().pattern(objectIdPattern),
  customerId: Joi.string().pattern(objectIdPattern),
  search: Joi.string().max(100),
});

const qrIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required(),
});

const qrCodeParamSchema = Joi.object({
  code: Joi.string().required(),
});

const analyticsSchema = Joi.object({
  days: Joi.number().integer().min(1).max(365).default(30),
});

// ─── PUBLIC ROUTES (no auth) ───
// QR verification — anyone can verify a QR code
router.get('/verify/:code', validate(qrCodeParamSchema, 'params'), qrController.verify);
router.get('/:id/image', validate(qrIdParamSchema, 'params'), qrController.serveImage);

// ─── AUTHENTICATED ROUTES ───
router.use(authenticate);

// Stats & Analytics
router.get('/stats', qrController.getStats);
router.get('/analytics', validate(analyticsSchema, 'query'), qrController.getAnalytics);

// Public-like (scan by code)
router.post('/scan', validate(scanQRSchema), qrController.scan);
router.get('/code/:code', validate(qrCodeParamSchema, 'params'), qrController.getByCode);

// Admin routes
router.get('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR, roles.OPERATIONS), validate(listQRSchema, 'query'), qrController.list);
router.post('/', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(generateQRSchema), qrController.generate);
router.post('/bulk-generate', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(bulkGenerateSchema), qrController.bulkGenerate);
router.get('/:id', qrController.getById);
router.get('/:id/history', validate(qrIdParamSchema, 'params'), qrController.getScanHistory);
router.get('/:id/download/png', qrController.downloadPng);
router.get('/:id/download/svg', qrController.downloadSvg);
router.get('/:id/download/pdf', qrController.downloadPdf);
router.patch('/:id/activate', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(qrIdParamSchema, 'params'), qrController.activate);
router.patch('/:id/damaged', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(qrIdParamSchema, 'params'), validate(reportDamagedSchema), qrController.reportDamaged);
router.post('/:id/replace', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(qrIdParamSchema, 'params'), validate(replaceQRSchema), qrController.replace);
router.delete('/:id', authorize(roles.SUPER_ADMIN, roles.MANAGER), validate(qrIdParamSchema, 'params'), qrController.delete);

module.exports = router;
