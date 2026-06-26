const Joi = require('joi');
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const sendNotificationSchema = Joi.object({
  recipientId: Joi.string().pattern(objectIdPattern).required(),
  recipientRole: Joi.string().optional(),
  type: Joi.string().valid('task_assignment', 'task_reminder', 'attendance_alert', 'issue_update', 'payment_update', 'leave_status', 'incentive', 'booking_update', 'subscription_reminder', 'complaint_update', 'announcement', 'training', 'system').required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  imageUrl: Joi.string().uri().allow('', null),
});

const sendBulkSchema = Joi.object({
  roles: Joi.array().items(Joi.string().valid('super_admin', 'manager', 'supervisor', 'operations', 'franchise', 'cleaner', 'customer')).min(1).required(),
  type: Joi.string().valid('task_assignment', 'task_reminder', 'attendance_alert', 'issue_update', 'payment_update', 'leave_status', 'incentive', 'booking_update', 'subscription_reminder', 'complaint_update', 'announcement', 'training', 'system').required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
});

const listNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string(),
  isRead: Joi.boolean(),
  recipientRole: Joi.string(),
  fromDate: Joi.date(),
  toDate: Joi.date(),
});

const listForUserSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isRead: Joi.boolean(),
  type: Joi.string(),
});

const notificationIdParamSchema = Joi.object({ id: Joi.string().pattern(objectIdPattern).required() });
const userIdParamSchema = Joi.object({ userId: Joi.string().pattern(objectIdPattern).required() });

module.exports = { sendNotificationSchema, sendBulkSchema, listNotificationsSchema, listForUserSchema, notificationIdParamSchema, userIdParamSchema };
