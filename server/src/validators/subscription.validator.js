const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createPackageSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  price: Joi.number().positive().required(),
  discountPrice: Joi.number().min(0),
  gstPercent: Joi.number().min(0).max(100).default(18),
  setupFee: Joi.number().min(0).default(0),
  frequencyOptions: Joi.array().items(Joi.string()),
  cleaningsPerMonth: Joi.number().integer().min(1).default(4),
  durationMonths: Joi.number().integer().min(1).default(1),
  services: Joi.array().items(Joi.object({
    serviceId: Joi.string(),
    name: Joi.string(),
    included: Joi.boolean().default(true),
  })),
  features: Joi.array().items(Joi.string()),
  isPopular: Joi.boolean().default(false),
  sortOrder: Joi.number().integer().min(0).default(0),
});

const updatePackageSchema = Joi.object({
  name: Joi.string(), code: Joi.string(),
  price: Joi.number().positive(), discountPrice: Joi.number().min(0),
  gstPercent: Joi.number().min(0).max(100), setupFee: Joi.number().min(0),
  frequencyOptions: Joi.array().items(Joi.string()),
  cleaningsPerMonth: Joi.number().integer().min(1),
  durationMonths: Joi.number().integer().min(1),
  services: Joi.array().items(Joi.object({ serviceId: Joi.string(), name: Joi.string(), included: Joi.boolean() })),
  features: Joi.array().items(Joi.string()),
  isPopular: Joi.boolean(), sortOrder: Joi.number().integer().min(0), isActive: Joi.boolean(),
});

const subscribeSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required(),
  vehicleId: Joi.string().pattern(objectIdPattern).required(),
  packageId: Joi.string().pattern(objectIdPattern).required(),
  frequency: Joi.string().valid('weekly', 'biweekly', 'monthly').default('monthly'),
  startDate: Joi.date().optional(),
  autoRenew: Joi.boolean().default(false),
});

const cancelSubscriptionSchema = Joi.object({
  reason: Joi.string().max(500).allow('', null),
  cancelledBy: Joi.string().valid('customer', 'admin').default('customer'),
  refundEligible: Joi.boolean().default(false),
});

const listSubscriptionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('trial', 'active', 'expired', 'cancelled', 'pending', 'paused', 'All Status').optional(),
  customerId: Joi.string().pattern(objectIdPattern).optional(),
  vehicleId: Joi.string().pattern(objectIdPattern).optional(),
  packageId: Joi.alternatives().try(Joi.string().pattern(objectIdPattern), Joi.string().valid('All Packages')).optional(),
  apartmentId: Joi.alternatives().try(Joi.string().pattern(objectIdPattern), Joi.string().valid('All Apartments')).optional(),
  supervisorId: Joi.alternatives().try(Joi.string().pattern(objectIdPattern), Joi.string().valid('All Supervisors')).optional(),
  search: Joi.string().allow('', null).optional(),
});

const listPackagesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean(),
});

const subscriptionIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required(),
});

const updateSubscriptionSchema = Joi.object({
  status: Joi.string().valid('active', 'expired', 'pending', 'cancelled', 'paused'),
  remainingCleanings: Joi.number().integer().min(0),
  autoRenew: Joi.boolean(),
});

module.exports = { createPackageSchema, updatePackageSchema, subscribeSchema, cancelSubscriptionSchema, listSubscriptionsSchema, listPackagesSchema, subscriptionIdParamSchema, updateSubscriptionSchema };
