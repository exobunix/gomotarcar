const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createComplaintSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required(),
  serviceType: Joi.string().valid('cleaning', 'service_booking', 'fasttag', 'subscription', 'other').optional(),
  referenceId: Joi.string().pattern(objectIdPattern).optional(),
  category: Joi.string().valid('service_quality', 'cleaner_behavior', 'billing', 'scheduling', 'other').optional(),
  description: Joi.string().max(2000).required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
});

const assignComplaintSchema = Joi.object({
  userId: Joi.string().pattern(objectIdPattern).required(),
});

const resolveComplaintSchema = Joi.object({
  resolution: Joi.string().max(2000).allow('', null),
});

const closeComplaintSchema = Joi.object({
  customerRating: Joi.number().integer().min(1).max(5).optional(),
});

const updatePrioritySchema = Joi.object({
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
});

const listComplaintsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('open', 'in_progress', 'resolved', 'closed'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  category: Joi.string().valid('service_quality', 'cleaner_behavior', 'billing', 'scheduling', 'other'),
  customerId: Joi.string().pattern(objectIdPattern),
  serviceType: Joi.string().valid('cleaning', 'service_booking', 'fasttag', 'subscription', 'other'),
  search: Joi.string().max(100),
});

const complaintIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const ticketNumberParamSchema = Joi.object({ ticketNumber: Joi.string().required() });

module.exports = { createComplaintSchema, assignComplaintSchema, resolveComplaintSchema, closeComplaintSchema, updatePrioritySchema, listComplaintsSchema, complaintIdParamSchema, ticketNumberParamSchema };
