const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createApartmentSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid customer ID',
    'any.required': 'Customer ID is required',
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Apartment name is required',
  }),
  tower: Joi.string().max(50).allow('', null),
  flatNumber: Joi.string().max(20).allow('', null),
  society: Joi.string().max(100).allow('', null),
  street: Joi.string().max(200).allow('', null),
  area: Joi.string().max(100).allow('', null),
  city: Joi.string().max(100).required().messages({
    'any.required': 'City is required',
  }),
  state: Joi.string().max(100).allow('', null),
  pincode: Joi.string().max(10).allow('', null),
  coordinates: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
  label: Joi.string().valid('Apartment', 'Villa', 'Society', 'Independent House', 'Other').default('Apartment'),
});

const updateApartmentSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  tower: Joi.string().max(50).allow('', null),
  flatNumber: Joi.string().max(20).allow('', null),
  society: Joi.string().max(100).allow('', null),
  street: Joi.string().max(200).allow('', null),
  area: Joi.string().max(100).allow('', null),
  city: Joi.string().max(100),
  state: Joi.string().max(100).allow('', null),
  pincode: Joi.string().max(10).allow('', null),
  coordinates: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
  label: Joi.string().valid('Apartment', 'Villa', 'Society', 'Independent House', 'Other'),
  isDefault: Joi.boolean(),
});

const apartmentIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid apartment ID',
    'any.required': 'Apartment ID is required',
  }),
});

const listApartmentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  city: Joi.string(),
  search: Joi.string().max(100),
});

const customerIdParamSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid customer ID',
  }),
});

module.exports = {
  createApartmentSchema,
  updateApartmentSchema,
  apartmentIdParamSchema,
  listApartmentsSchema,
  customerIdParamSchema,
};
