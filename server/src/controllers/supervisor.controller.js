const supervisorService = require('../services/supervisor.service');

const supervisorController = {
  /**
   * POST /api/v1/supervisor
   * Create a new supervisor
   */
  create: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.create(req.body);
      res.status(201).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/supervisor
   * List supervisors with filtering and pagination
   */
  list: async (req, res, next) => {
    try {
      const result = await supervisorService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/supervisor/:id
   * Get supervisor by ID
   */
  getById: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.getById(req.params.id);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/supervisor/:id
   * Update supervisor
   */
  update: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/supervisor/:id/verify
   * Verify (activate) supervisor
   */
  verify: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.verifySupervisor(req.params.id);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/supervisor/:id/deactivate
   * Deactivate supervisor
   */
  deactivate: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/supervisor/:id
   * Delete supervisor permanently
   */
  delete: async (req, res, next) => {
    try {
      const result = await supervisorService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/supervisor/stats
   * Get supervisor dashboard stats (6 KPIs)
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await supervisorService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/supervisor/:id/cleaners
   * Get cleaners under a supervisor
   */
  getCleaners: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.getById(req.params.id);
      const cleaners = await supervisorService.getByZone(supervisor.assignedZone?._id || supervisor.assignedZone);
      res.status(200).json({ success: true, data: cleaners });
    } catch (error) {
      next(error);
    }
  },

  allocateApartment: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.allocateApartment(req.params.id, req.body);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  allocateCleaner: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.allocateCleaner(req.params.id, req.body);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  allocateQr: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.allocateQr(req.params.id, req.body);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  approveWork: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.approveWork(req.params.id, req.body);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },

  rejectWork: async (req, res, next) => {
    try {
      const supervisor = await supervisorService.rejectWork(req.params.id, req.body);
      res.status(200).json({ success: true, data: supervisor });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = supervisorController;
