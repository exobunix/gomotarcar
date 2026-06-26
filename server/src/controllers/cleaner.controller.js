const cleanerService = require('../services/cleaner.service');

const cleanerController = {
  /**
   * POST /api/v1/cleaner
   * Create a new cleaner
   */
  create: async (req, res, next) => {
    try {
      const cleaner = await cleanerService.create(req.body);
      res.status(201).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaner
   * List cleaners with filtering and pagination
   */
  list: async (req, res, next) => {
    try {
      const result = await cleanerService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaner/:id
   * Get cleaner by ID
   */
  getById: async (req, res, next) => {
    try {
      const cleaner = await cleanerService.getById(req.params.id);
      res.status(200).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/cleaner/:id
   * Update cleaner
   */
  update: async (req, res, next) => {
    try {
      const cleaner = await cleanerService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/cleaner/:id/stats
   * Update cleaner stats
   */
  updateStats: async (req, res, next) => {
    try {
      const cleaner = await cleanerService.updateStats(req.params.id, req.body);
      res.status(200).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/cleaner/:id/document-status
   * Update cleaner document verification status
   */
  updateDocumentStatus: async (req, res, next) => {
    try {
      const { documentId, status, rejectionReason } = req.body;
      const cleaner = await cleanerService.updateDocumentStatus(
        req.params.id, documentId, status, rejectionReason
      );
      res.status(200).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/cleaner/:id/verify
   * Verify cleaner
   */
  verify: async (req, res, next) => {
    try {
      const cleaner = await cleanerService.verifyCleaner(req.params.id);
      res.status(200).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/cleaner/:id/deactivate
   * Deactivate cleaner
   */
  deactivate: async (req, res, next) => {
    try {
      const cleaner = await cleanerService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: cleaner });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/cleaner/:id
   * Delete cleaner permanently
   */
  delete: async (req, res, next) => {
    try {
      const result = await cleanerService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/cleaner/stats
   * Get cleaner dashboard stats
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await cleanerService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = cleanerController;
