const marketplaceService = require('../services/service-marketplace.service');

const marketplaceController = {
  // Categories
  listCategories: async (req, res, next) => {
    try {
      const result = await marketplaceService.listCategories(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  createCategory: async (req, res, next) => {
    try {
      const category = await marketplaceService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) { next(error); }
  },

  updateCategory: async (req, res, next) => {
    try {
      const category = await marketplaceService.updateCategory(req.params.id, req.body);
      res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const result = await marketplaceService.deleteCategory(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  // Providers
  listProviders: async (req, res, next) => {
    try {
      const result = await marketplaceService.listProviders(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  createProvider: async (req, res, next) => {
    try {
      const provider = await marketplaceService.createProvider(req.body);
      res.status(201).json({ success: true, data: provider });
    } catch (error) { next(error); }
  },

  updateProvider: async (req, res, next) => {
    try {
      const provider = await marketplaceService.updateProvider(req.params.id, req.body);
      res.status(200).json({ success: true, data: provider });
    } catch (error) { next(error); }
  },

  deleteProvider: async (req, res, next) => {
    try {
      const result = await marketplaceService.deleteProvider(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await marketplaceService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = marketplaceController;
