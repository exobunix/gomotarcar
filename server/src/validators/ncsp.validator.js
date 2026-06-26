const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const phonePattern = /^\+?[1-9]\d{9,14}$/;

const createNcspPartnerSchema = Joi.object({
  partnerName: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Partner Name is required',
  }),
  ownerName: Joi.string().min(2).max(50).required().messages({
    'any.required': 'Contact Person name is required',
  }),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid number',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
  }),
  street: Joi.string().allow('', null),
  city: Joi.string().required().messages({
    'any.required': 'City is required',
  }),
  state: Joi.string().allow('', null),
  pincode: Joi.string().allow('', null),
  region: Joi.string().required().messages({
    'any.required': 'Region is required',
  }),
  gstin: Joi.string().allow('', null),
  logo: Joi.string().uri().allow('', null),
});

const updateNcspPartnerSchema = Joi.object({
  partnerName: Joi.string().min(2).max(100),
  ownerName: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(phonePattern),
  email: Joi.string().email(),
  street: Joi.string().allow('', null),
  city: Joi.string(),
  state: Joi.string().allow('', null),
  pincode: Joi.string().allow('', null),
  region: Joi.string(),
  gstin: Joi.string().allow('', null),
  logo: Joi.string().uri().allow('', null),
  isActive: Joi.boolean(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected'),
});

const listNcspPartnersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  region: Joi.string().allow('', null),
  search: Joi.string().max(100).allow('', null),
});

const ncspPartnerIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid partner ID',
    'any.required': 'Partner ID is required',
  }),
});

module.exports = {
  createNcspPartnerSchema,
  updateNcspPartnerSchema,
  listNcspPartnersSchema,
  ncspPartnerIdParamSchema,
};
