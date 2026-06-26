const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const updateLocationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  speed: Joi.number().min(0).optional(),
  heading: Joi.number().min(0).max(360).optional(),
  accuracy: Joi.number().min(0).optional(),
  batteryLevel: Joi.number().min(0).max(100).optional(),
  currentTaskId: Joi.string().pattern(objectIdPattern).optional(),
  assignedZone: Joi.string().pattern(objectIdPattern).optional(),
});

const verifyGPSSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const checkGeofenceSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const findNearestSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  maxDistance: Joi.number().min(100).default(5000),
  limit: Joi.number().integer().min(1).max(50).default(10),
  zoneId: Joi.string().pattern(objectIdPattern).optional(),
  excludeCleanerId: Joi.string().pattern(objectIdPattern).optional(),
});

const findNearbyZonesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  maxDistance: Joi.number().min(100).default(10000),
});

const optimizeRouteSchema = Joi.object({
  date: Joi.date().optional(),
});

const findOptimalCleanerSchema = Joi.object({
  taskId: Joi.string().pattern(objectIdPattern).optional(),
  zoneId: Joi.string().pattern(objectIdPattern).optional(),
  maxDistance: Joi.number().min(100).default(10000),
});

const estimateTravelTimeSchema = Joi.object({
  distanceMeters: Joi.number().positive().required(),
  averageSpeedKmh: Joi.number().positive().default(25),
});

const locationHistorySchema = Joi.object({
  fromDate: Joi.date().optional(),
  toDate: Joi.date().optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
});

const cleanerIdParamSchema = Joi.object({ cleanerId: Joi.string().pattern(objectIdPattern).required() });
const zoneIdParamSchema = Joi.object({ zoneId: Joi.string().pattern(objectIdPattern).required() });

module.exports = { updateLocationSchema, verifyGPSSchema, checkGeofenceSchema, findNearestSchema, findNearbyZonesSchema, optimizeRouteSchema, findOptimalCleanerSchema, estimateTravelTimeSchema, locationHistorySchema, cleanerIdParamSchema, zoneIdParamSchema };
