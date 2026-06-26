const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const adminRoleSchema = Joi.string().valid('super_admin', 'manager', 'operations');
const permissionSchema = Joi.string().valid(
  'cleaners_manage', 'customers_manage', 'tasks_manage',
  'payments_manage', 'training_manage', 'zones_manage',
  'analytics_view', 'settings_manage', 'support_manage'
);

const phonePattern = /^\+?[1-9]\d{9,14}$/;

const createAdminSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().max(50).allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid international number',
    'any.required': 'Phone number is required',
  }),
  role: adminRoleSchema.default('operations'),
  permissions: Joi.array().items(permissionSchema).default([]),
});

const updateAdminSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().max(50).allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().pattern(phonePattern),
  role: adminRoleSchema,
  permissions: Joi.array().items(permissionSchema),
  isActive: Joi.boolean(),
});

const updatePermissionsSchema = Joi.object({
  permissions: Joi.array().items(permissionSchema).required().messages({
    'any.required': 'Permissions array is required',
  }),
});

const adminIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid admin ID',
    'any.required': 'Admin ID is required',
  }),
});

const listAdminsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: adminRoleSchema,
  isActive: Joi.boolean(),
  search: Joi.string().max(100),
});

module.exports = {
  createAdminSchema,
  updateAdminSchema,
  updatePermissionsSchema,
  adminIdParamSchema,
  listAdminsSchema,
};
