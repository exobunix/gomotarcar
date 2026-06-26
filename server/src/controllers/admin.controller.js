const adminService = require('../services/admin.service');

const adminController = {
  /**
   * POST /api/v1/admin
   * Create a new admin (super_admin only)
   */
  create: async (req, res, next) => {
    try {
      const admin = await adminService.create(req.body);
      res.status(201).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin
   * List all admins with filtering and pagination
   */
  list: async (req, res, next) => {
    try {
      const result = await adminService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/:id
   * Get admin by ID
   */
  getById: async (req, res, next) => {
    try {
      const admin = await adminService.getById(req.params.id);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/admin/:id
   * Update admin profile
   */
  update: async (req, res, next) => {
    try {
      const admin = await adminService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/admin/:id/permissions
   * Update admin permissions
   */
  updatePermissions: async (req, res, next) => {
    try {
      const admin = await adminService.updatePermissions(req.params.id, req.body.permissions);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/admin/:id/deactivate
   * Deactivate admin
   */
  deactivate: async (req, res, next) => {
    try {
      const admin = await adminService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/admin/:id
   * Delete admin permanently
   */
  delete: async (req, res, next) => {
    try {
      const result = await adminService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/admin/stats
   * Get admin dashboard stats
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await adminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
