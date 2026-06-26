const franchiseService = require('../services/franchise.service');

const franchiseController = {
  /**
   * POST /api/v1/franchise
   * Create a new franchise partner
   */
  create: async (req, res, next) => {
    try {
      const franchise = await franchiseService.create(req.body);
      res.status(201).json({ success: true, data: franchise });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/franchise
   * List franchises with filtering and pagination
   */
  list: async (req, res, next) => {
    try {
      const result = await franchiseService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/franchise/:id
   * Get franchise by ID
   */
  getById: async (req, res, next) => {
    try {
      const franchise = await franchiseService.getById(req.params.id);
      res.status(200).json({ success: true, data: franchise });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/franchise/:id
   * Update franchise
   */
  update: async (req, res, next) => {
    try {
      const franchise = await franchiseService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: franchise });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/franchise/:id/verify
   * Update franchise verification status
   */
  verify: async (req, res, next) => {
    try {
      const { status, documentStatuses } = req.body;
      const franchise = await franchiseService.verify(req.params.id, status, documentStatuses);
      res.status(200).json({ success: true, data: franchise });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/franchise/:id/deactivate
   * Deactivate franchise
   */
  deactivate: async (req, res, next) => {
    try {
      const franchise = await franchiseService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: franchise });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/franchise/:id
   * Delete franchise permanently
   */
  delete: async (req, res, next) => {
    try {
      const result = await franchiseService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/franchise/stats
   * Get franchise dashboard stats
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await franchiseService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = franchiseController;
