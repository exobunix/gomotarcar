const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const generateQRSchema = Joi.object({
  vehicleId: Joi.string().pattern(objectIdPattern).required(),
  customerId: Joi.string().pattern(objectIdPattern).required(),
});

const scanQRSchema = Joi.object({
  code: Joi.string().required(),
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
  status: Joi.string().valid('pending_activation', 'active', 'replaced', 'damaged'),
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

module.exports = { generateQRSchema, scanQRSchema, reportDamagedSchema, replaceQRSchema, listQRSchema, qrIdParamSchema, qrCodeParamSchema };
