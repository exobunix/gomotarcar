const subscriptionService = require('../services/subscription.service');

const subscriptionController = {
  // Package management
  createPackage: async (req, res, next) => {
    try {
      const pkg = await subscriptionService.createPackage(req.body);
      res.status(201).json({ success: true, data: pkg });
    } catch (error) { next(error); }
  },

  updatePackage: async (req, res, next) => {
    try {
      const pkg = await subscriptionService.updatePackage(req.params.id, req.body);
      res.status(200).json({ success: true, data: pkg });
    } catch (error) { next(error); }
  },

  listPackages: async (req, res, next) => {
    try {
      const result = await subscriptionService.listPackages(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  // Subscription management
  subscribe: async (req, res, next) => {
    try {
      const sub = await subscriptionService.subscribe(req.body);
      res.status(201).json({ success: true, data: sub });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await subscriptionService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const sub = await subscriptionService.getById(req.params.id);
      res.status(200).json({ success: true, data: sub });
    } catch (error) { next(error); }
  },

  updateSubscription: async (req, res, next) => {
    try {
      const sub = await subscriptionService.updateSubscription(req.params.id, req.body);
      res.status(200).json({ success: true, data: sub });
    } catch (error) { next(error); }
  },

  cancel: async (req, res, next) => {
    try {
      const sub = await subscriptionService.cancel(req.params.id, req.body);
      res.status(200).json({ success: true, data: sub });
    } catch (error) { next(error); }
  },

  useCleaning: async (req, res, next) => {
    try {
      const sub = await subscriptionService.useCleaning(req.params.id);
      res.status(200).json({ success: true, data: sub });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await subscriptionService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = subscriptionController;
