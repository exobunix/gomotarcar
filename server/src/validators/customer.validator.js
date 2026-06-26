const Joi = require('joi');

const updateCustomerSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  pincode: Joi.string().optional(),
  photo: Joi.string().optional(),
  profilePhoto: Joi.string().optional(),
  subscriptionStatus: Joi.string().valid('none', 'active', 'expired', 'cancelled').optional(),
  isActive: Joi.boolean().optional(),
  totalBookings: Joi.number().integer().min(0).optional(),
  totalSpent: Joi.number().min(0).optional(),
  totalCleanings: Joi.number().integer().min(0).optional(),
  cleaningBalance: Joi.number().integer().min(0).optional(),
}).min(1);

const addVehicleSchema = Joi.object({
  registrationNumber: Joi.string().required(),
  make: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().required(),
  color: Joi.string().optional(),
  vehicleType: Joi.string().valid('sedan', 'suv', 'hatchback', 'truck', 'van').required(),
});

const listCustomersSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
}).unknown(true);

const customerIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'Customer ID is required',
  }),
});

module.exports = {
  updateCustomerSchema,
  addVehicleSchema,
  listCustomersSchema,
  customerIdParamSchema,
};
