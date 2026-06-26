const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const phonePattern = /^\+?[1-9]\d{9,14}$/;

const createCleanerSchema = Joi.object({
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
  photo: Joi.string().uri().allow('', null),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  alternatePhone: Joi.string().pattern(phonePattern).allow('', null),
  emergencyContact: Joi.object({
    name: Joi.string().allow('', null),
    phone: Joi.string().pattern(phonePattern).allow('', null),
    relation: Joi.string().allow('', null),
  }).optional(),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    coordinates: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }).optional(),
  }).optional(),
  assignedZone: Joi.string().pattern(objectIdPattern).allow('', null),
  supervisorId: Joi.string().pattern(objectIdPattern).allow('', null),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters',
  }),
  experience: Joi.number().integer().min(0).default(0),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract').default('full-time'),
  language: Joi.string().default('en'),
});

const updateCleanerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().max(50).allow('', null),
  phone: Joi.string().pattern(phonePattern),
  email: Joi.string().email().allow('', null),
  photo: Joi.string().uri().allow('', null),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other'),
  alternatePhone: Joi.string().pattern(phonePattern).allow('', null),
  emergencyContact: Joi.object({
    name: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    relation: Joi.string().allow('', null),
  }).optional(),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    coordinates: Joi.object({
      type: Joi.string().valid('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2),
    }).optional(),
  }).optional(),
  assignedZone: Joi.string().pattern(objectIdPattern).allow('', null),
  supervisorId: Joi.string().pattern(objectIdPattern).allow('', null),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters',
  }),
  experience: Joi.number().integer().min(0),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract'),
  language: Joi.string(),
  notificationsEnabled: Joi.boolean(),
  locationTrackingEnabled: Joi.boolean(),
  bankDetails: Joi.object({
    accountHolder: Joi.string().allow('', null),
    accountNumber: Joi.string().allow('', null),
    ifscCode: Joi.string().allow('', null),
    bankName: Joi.string().allow('', null),
    upiId: Joi.string().allow('', null),
    paymentPreference: Joi.string().valid('bank', 'upi'),
  }).optional(),
});

const listCleanersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected'),
  assignedZone: Joi.string().pattern(objectIdPattern),
  supervisorId: Joi.string().pattern(objectIdPattern),
  employmentType: Joi.string().valid('full-time', 'part-time', 'contract'),
  search: Joi.string().max(100),
});

const cleanerIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid cleaner ID',
    'any.required': 'Cleaner ID is required',
  }),
});

const updateStatsSchema = Joi.object({
  totalTasksCompleted: Joi.number().integer().min(0),
  totalEarnings: Joi.number().min(0),
  averageRating: Joi.number().min(0).max(5),
  currentMonthTasks: Joi.number().integer().min(0),
  currentMonthEarnings: Joi.number().min(0),
});

const updateDocStatusSchema = Joi.object({
  documentId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Document ID is required',
  }),
  status: Joi.string().valid('verified', 'rejected', 'pending').required().messages({
    'any.required': 'Document status is required',
  }),
  rejectionReason: Joi.string().max(500).allow('', null),
});

module.exports = {
  createCleanerSchema,
  updateCleanerSchema,
  listCleanersSchema,
  cleanerIdParamSchema,
  updateStatsSchema,
  updateDocStatusSchema,
};
