const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const applyLeaveSchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
  leaveType: Joi.string().valid('sick', 'casual', 'earned', 'emergency', 'other').required(),
  fromDate: Joi.date().required(),
  toDate: Joi.date().required(),
  reason: Joi.string().max(1000).allow('', null),
  attachment: Joi.string().uri().allow('', null),
  isHalfDay: Joi.boolean().default(false),
});

const rejectLeaveSchema = Joi.object({
  reason: Joi.string().max(500).required(),
});

const listLeaveSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cleanerId: Joi.string().pattern(objectIdPattern),
  status: Joi.string().valid('pending', 'approved', 'rejected'),
  leaveType: Joi.string().valid('sick', 'casual', 'earned', 'emergency', 'other'),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const leaveIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const cleanerBalanceParamSchema = Joi.object({ cleanerId: Joi.string().pattern(objectIdPattern).required() });

module.exports = { applyLeaveSchema, rejectLeaveSchema, listLeaveSchema, leaveIdParamSchema, cleanerBalanceParamSchema };
