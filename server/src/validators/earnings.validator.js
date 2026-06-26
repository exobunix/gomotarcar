const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const calculatePeriodSchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
  periodType: Joi.string().valid('daily', 'weekly', 'monthly').required(),
  periodStart: Joi.date().required(),
  periodEnd: Joi.date().required(),
});

const listEarningsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cleanerId: Joi.string().pattern(objectIdPattern),
  paymentStatus: Joi.string().valid('pending', 'processed', 'paid', 'failed'),
  periodType: Joi.string().valid('daily', 'weekly', 'monthly'),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const earningsIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const taskIdParamSchema = Joi.object({ taskId: Joi.string().pattern(objectIdPattern).required() });
const cleanerSummaryParamSchema = Joi.object({ cleanerId: Joi.string().pattern(objectIdPattern).required() });

const markAsPaidSchema = Joi.object({
  payoutId: Joi.string().pattern(objectIdPattern).optional(),
});

module.exports = { calculatePeriodSchema, listEarningsSchema, earningsIdParamSchema, taskIdParamSchema, cleanerSummaryParamSchema, markAsPaidSchema };
