const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const phonePattern = /^\+?\d{10,15}$/;

const createSupervisorSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().max(50).allow('', null),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid international number',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email().allow('', null),
  assignedZone: Joi.string().pattern(objectIdPattern).allow('', null),
  experience: Joi.number().integer().min(0).default(0),
  password: Joi.string().min(6).allow('', null),
});

const updateSupervisorSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().max(50).allow('', null),
  phone: Joi.string().pattern(phonePattern),
  email: Joi.string().email().allow('', null),
  photo: Joi.string().uri().allow('', null),
  assignedZone: Joi.string().pattern(objectIdPattern).allow('', null),
  isActive: Joi.boolean(),
  experience: Joi.number().integer().min(0),
});

const listSupervisorsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.any(),
  assignedZone: Joi.string().pattern(objectIdPattern).allow('', null),
  search: Joi.string().max(100).allow('', null),
  verificationStatus: Joi.string().max(50).allow('', null),
  apartmentId: Joi.string().pattern(objectIdPattern).allow('', null),
});

const supervisorIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid supervisor ID',
    'any.required': 'Supervisor ID is required',
  }),
});

module.exports = {
  createSupervisorSchema,
  updateSupervisorSchema,
  listSupervisorsSchema,
  supervisorIdParamSchema,
};
