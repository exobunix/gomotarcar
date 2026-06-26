const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createBookingSchema = Joi.object({
  customerId: Joi.string().pattern(objectIdPattern).required(),
  vehicleId: Joi.string().pattern(objectIdPattern).required(),
  categoryId: Joi.string().pattern(objectIdPattern).optional(),
  serviceName: Joi.string().allow('', null),
  providerId: Joi.string().pattern(objectIdPattern).optional(),
  franchiseId: Joi.string().pattern(objectIdPattern).optional(),
  slotDate: Joi.date().required(),
  slotTime: Joi.string().allow('', null),
  serviceMode: Joi.string().valid('workshop', 'pickup_drop', 'doorstep').default('workshop'),
  basePrice: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('booked', 'accepted', 'in_progress', 'completed', 'cancelled', 'job_card_pending', 'job_card_approved').required(),
  note: Joi.string().max(500).allow('', null),
});

const addExtraChargeSchema = Joi.object({
  item: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

const addReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  text: Joi.string().max(1000).allow('', null),
});

const listBookingsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('booked', 'accepted', 'in_progress', 'completed', 'cancelled', 'job_card_pending', 'job_card_approved'),
  customerId: Joi.string().pattern(objectIdPattern),
  vehicleId: Joi.string().pattern(objectIdPattern),
  franchiseId: Joi.string().pattern(objectIdPattern),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const bookingIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const chargeIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required(), chargeId: Joi.string().pattern(objectIdPattern).required() });

module.exports = { createBookingSchema, updateBookingStatusSchema, addExtraChargeSchema, addReviewSchema, listBookingsSchema, bookingIdParamSchema, chargeIdParamSchema };
