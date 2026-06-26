const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const phonePattern = /^\+?[1-9]\d{9,14}$/;

const createFranchiseSchema = Joi.object({
  franchiseName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Franchise name is required',
  }),
  ownerName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Owner name is required',
  }),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid international number',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email().allow('', null),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().required().messages({ 'any.required': 'City is required' }),
    state: Joi.string().required().messages({ 'any.required': 'State is required' }),
    pincode: Joi.string().allow('', null),
    coordinates: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }).optional(),
  }).required().messages({ 'any.required': 'Address is required' }),
  type: Joi.string().valid('workshop', 'service_center', 'cleaning_station').default('cleaning_station'),
  servicesOffered: Joi.array().items(Joi.string()).default([]),
  serviceZones: Joi.array().items(Joi.string().pattern(objectIdPattern)).default([]),
  agreement: Joi.object({
    commissionPercent: Joi.number().min(0).max(100).default(10),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }).optional(),
  bankDetails: Joi.object({
    accountHolder: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    ifscCode: Joi.string().allow('', null),
    upiId: Joi.string().allow('', null),
  }).optional(),
});

const updateFranchiseSchema = Joi.object({
  franchiseName: Joi.string().min(2).max(100),
  ownerName: Joi.string().min(2).max(100),
  phone: Joi.string().pattern(phonePattern),
  email: Joi.string().email().allow('', null),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string(),
    state: Joi.string(),
    pincode: Joi.string().allow('', null),
    coordinates: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }).optional(),
  }).optional(),
  type: Joi.string().valid('workshop', 'service_center', 'cleaning_station'),
  servicesOffered: Joi.array().items(Joi.string()),
  serviceZones: Joi.array().items(Joi.string().pattern(objectIdPattern)),
  isActive: Joi.boolean(),
  bankDetails: Joi.object({
    accountHolder: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    ifscCode: Joi.string().allow('', null),
    upiId: Joi.string().allow('', null),
  }).optional(),
  agreement: Joi.object({
    commissionPercent: Joi.number().min(0).max(100),
    startDate: Joi.date(),
    endDate: Joi.date(),
    documentUrl: Joi.string().allow('', null),
  }).optional(),
});

const verifyFranchiseSchema = Joi.object({
  status: Joi.string().valid('verified', 'rejected', 'pending').required().messages({
    'any.required': 'Verification status is required',
  }),
  documentStatuses: Joi.array().items(Joi.object({
    documentId: Joi.string().pattern(objectIdPattern).required(),
    status: Joi.string().valid('verified', 'rejected', 'pending').required(),
  })).optional(),
});

const listFranchisesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected'),
  type: Joi.string().valid('workshop', 'service_center', 'cleaning_station'),
  search: Joi.string().max(100),
});

const franchiseIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid franchise ID',
    'any.required': 'Franchise ID is required',
  }),
});

module.exports = {
  createFranchiseSchema,
  updateFranchiseSchema,
  verifyFranchiseSchema,
  listFranchisesSchema,
  franchiseIdParamSchema,
};
