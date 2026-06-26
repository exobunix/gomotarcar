const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const Joi = require('joi');

const searchSchema = Joi.object({
  q: Joi.string().trim().required(),
  type: Joi.string().valid('services', 'providers', 'nearby_mechanics', 'faqs', 'all').default('all'),
  location: Joi.string().trim().allow('', null),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const suggestionsSchema = Joi.object({
  q: Joi.string().trim().required(),
  limit: Joi.number().integer().min(1).max(10).default(5),
});

// Search endpoints
router.get('/', optionalAuth, validate(searchSchema, 'query'), searchController.search);
router.get('/nearby', optionalAuth, validate(searchSchema, 'query'), searchController.searchNearby);
router.get('/suggestions', optionalAuth, validate(suggestionsSchema, 'query'), searchController.getSuggestions);

module.exports = router;
