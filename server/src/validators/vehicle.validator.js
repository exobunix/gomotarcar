const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createVehicleSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid customer ID',
    'any.required': 'Customer ID is required',
  }),
  vehicleNumber: Joi.string()
    .pattern(/^[A-Za-z0-9\s-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Vehicle number must be alphanumeric',
      'any.required': 'Vehicle number is required',
    }),
  model: Joi.string().required().messages({ 'any.required': 'Vehicle model is required' }),
  make: Joi.string().required().messages({ 'any.required': 'Vehicle make is required' }),
  year: Joi.number().integer().min(1990).max(2030).optional(),
  color: Joi.string().allow('', null),
  fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'cng').optional(),
  vehicleType: Joi.string().valid('hatchback', 'sedan', 'suv', 'luxury', 'ev').optional(),
  photo: Joi.string().uri().allow('', null),
});

const updateVehicleSchema = Joi.object({
  model: Joi.string(),
  make: Joi.string(),
  year: Joi.number().integer().min(1990).max(2030),
  color: Joi.string().allow('', null),
  fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'cng'),
  vehicleType: Joi.string().valid('hatchback', 'sedan', 'suv', 'luxury', 'ev'),
  photo: Joi.string().uri().allow('', null),
  vehicleNumber: Joi.string().pattern(/^[A-Za-z0-9\s-]+$/),
  rcVerified: Joi.boolean(),
  pucExpiry: Joi.date(),
  isActive: Joi.boolean(),
});

const listVehiclesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  vehicleType: Joi.string().valid('hatchback', 'sedan', 'suv', 'luxury', 'ev'),
  isActive: Joi.boolean(),
  search: Joi.string().max(100),
});

const vehicleIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid vehicle ID',
    'any.required': 'Vehicle ID is required',
  }),
});

const customerIdParamSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid customer ID',
  }),
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  listVehiclesSchema,
  vehicleIdParamSchema,
  customerIdParamSchema,
};
