const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const calculateMonthlySchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
});

const calculateAllMonthlySchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
});

const listIncentivesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cleanerId: Joi.string().pattern(objectIdPattern),
  month: Joi.number().integer().min(1).max(12),
  year: Joi.number().integer().min(2020).max(2100),
  tier: Joi.string().valid('bronze', 'silver', 'gold', 'platinum', 'none'),
  isPaid: Joi.boolean(),
});

const leaderboardSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12),
  year: Joi.number().integer().min(2020).max(2100),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const incentiveIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const cleanerMonthParamSchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
  month: Joi.string().required(),
  year: Joi.string().required(),
});

const markPaidSchema = Joi.object({ payoutId: Joi.string().pattern(objectIdPattern).optional() });

module.exports = { calculateMonthlySchema, calculateAllMonthlySchema, listIncentivesSchema, leaderboardSchema, incentiveIdParamSchema, cleanerMonthParamSchema, markPaidSchema };
