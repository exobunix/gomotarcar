const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const checkInSchema = Joi.object({
  location: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
  address: Joi.string().max(500).allow('', null),
  selfieUrl: Joi.string().uri().allow('', null),
  deviceId: Joi.string().allow('', null),
  ip: Joi.string().allow('', null),
});

const checkOutSchema = Joi.object({
  location: Joi.object({
    type: Joi.string().valid('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),
  address: Joi.string().max(500).allow('', null),
  selfieUrl: Joi.string().uri().allow('', null),
});

const markAbsentSchema = Joi.object({
  date: Joi.date().required(),
  reason: Joi.string().max(500).allow('', null),
});

const listAttendanceSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cleanerId: Joi.string().pattern(objectIdPattern),
  status: Joi.string().valid('present', 'absent', 'half-day', 'late', 'leave', 'holiday'),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const attendanceIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const cleanerIdParamSchema = Joi.object({ cleanerId: Joi.string().pattern(objectIdPattern).required() });
const monthlySummarySchema = Joi.object({
  cleanerId: Joi.string().pattern(objectIdPattern).required(),
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
});

module.exports = { checkInSchema, checkOutSchema, markAbsentSchema, listAttendanceSchema, attendanceIdParamSchema, cleanerIdParamSchema, monthlySummarySchema };
