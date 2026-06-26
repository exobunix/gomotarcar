const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createTaskSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required(),
  vehicleId: Joi.string().pattern(objectIdPattern).required(),
  cleanerId: Joi.string().pattern(objectIdPattern).optional(),
  supervisorId: Joi.string().pattern(objectIdPattern).optional(),
  subscriptionId: Joi.string().pattern(objectIdPattern).optional(),
  scheduledDate: Joi.date().required(),
  scheduledTime: Joi.string().allow('', null),
  timeSlot: Joi.string().valid('morning', 'afternoon', 'evening').default('morning'),
  packageType: Joi.string().valid('basic', 'premium', 'elite').optional(),
  cleaningType: Joi.string().allow('', null),
  services: Joi.array().items(Joi.object({
    item: Joi.string(),
    label: Joi.string(),
  })).optional(),
  specialInstructions: Joi.string().max(1000).allow('', null),
  location: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
});

const assignCleanerSchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
});

const reassignSchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
  reason: Joi.string().max(500).allow('', null),
});

const completeTaskSchema = Joi.object({
  afterPhotos: Joi.array().items(Joi.string()),
  qrVerified: Joi.boolean(),
  cleanerEarnings: Joi.number().min(0),
});

const markMissedSchema = Joi.object({ reason: Joi.string().max(500).allow('', null) });

const autoAssignSchema = Joi.object({
  date: Joi.date().optional(),
  zoneId: Joi.string().pattern(objectIdPattern).optional(),
  preferredCleanerId: Joi.string().pattern(objectIdPattern).optional(),
});

const getAvailabilitySchema = Joi.object({
  date: Joi.date().optional(),
  zoneId: Joi.string().pattern(objectIdPattern).optional(),
});

const listTasksSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('assigned', 'in_progress', 'completed', 'missed', 'cancelled'),
  cleanerId: Joi.string().pattern(objectIdPattern),
  customerId: Joi.string().pattern(objectIdPattern),
  vehicleId: Joi.string().pattern(objectIdPattern),
  supervisorId: Joi.string().pattern(objectIdPattern),
  scheduledDate: Joi.date(),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const taskIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const taskStrIdParamSchema = Joi.object({ taskId: Joi.string().required() });
const cleanerIdParamSchema = Joi.object({ cleanerId: Joi.string().pattern(objectIdPattern).required() });

module.exports = { createTaskSchema, assignCleanerSchema, reassignSchema, completeTaskSchema, markMissedSchema, autoAssignSchema, getAvailabilitySchema, listTasksSchema, taskIdParamSchema, taskStrIdParamSchema, cleanerIdParamSchema };
