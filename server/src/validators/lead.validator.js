const Joi = require('joi');

const createLeadSchema = Joi.object({
  name: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().trim().allow('', null),
  service: Joi.string().trim().allow('', null),
  vehicleType: Joi.string().trim().allow('', null),
  location: Joi.string().trim().allow('', null),
  source: Joi.string().valid('search', 'website', 'referral', 'social_media', 'walk_in', 'call', 'other').default('search'),
  notes: Joi.string().allow('', null),
  customerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  preferredContact: Joi.string().valid('phone', 'email', 'whatsapp').default('phone'),
  bestTimeToCall: Joi.string().allow('', null),
});

const updateLeadStatusSchema = Joi.object({
  status: Joi.string().valid('New', 'Contacted', 'Interested', 'Converted', 'Lost').required(),
  notes: Joi.string().allow('', null),
});

const assignLeadSchema = Joi.object({
  userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

const listLeadsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('New', 'Contacted', 'Interested', 'Converted', 'Lost'),
  source: Joi.string().valid('search', 'website', 'referral', 'social_media', 'walk_in', 'call', 'other'),
  assignedTo: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  search: Joi.string().trim(),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
});

const leadIdParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
});

module.exports = {
  createLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  listLeadsSchema,
  leadIdParamSchema,
};
