const ncspService = require('../services/ncsp.service');

const ncspController = {
  create: async (req, res, next) => {
    try {
      const partner = await ncspService.create(req.body);
      res.status(201).json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const result = await ncspService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const partner = await ncspService.getById(req.params.id);
      res.status(200).json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const partner = await ncspService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  },

  deactivate: async (req, res, next) => {
    try {
      const partner = await ncspService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  },

  verify: async (req, res, next) => {
    try {
      const partner = await ncspService.verify(req.params.id);
      res.status(200).json({ success: true, data: partner });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const result = await ncspService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await ncspService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ncspController;
