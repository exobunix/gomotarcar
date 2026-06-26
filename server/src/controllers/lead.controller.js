const leadService = require('../services/lead.service');

const leadController = {
  /**
   * POST /api/v1/leads
   * Create a new lead
   */
  create: async (req, res, next) => {
    try {
      const lead = await leadService.create({ ...req.body, createdBy: req.userId });
      res.status(201).json({ success: true, data: lead });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/leads
   * List leads with filtering
   */
  list: async (req, res, next) => {
    try {
      const result = await leadService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/leads/:id
   * Get lead by ID
   */
  getById: async (req, res, next) => {
    try {
      const lead = await leadService.getById(req.params.id);
      res.status(200).json({ success: true, data: lead });
    } catch (error) { next(error); }
  },

  /**
   * PATCH /api/v1/leads/:id/status
   * Update lead status
   */
  updateStatus: async (req, res, next) => {
    try {
      const { status, notes } = req.body;
      const lead = await leadService.updateStatus(req.params.id, status, {
        notes, changedBy: req.userId,
      });
      res.status(200).json({ success: true, data: lead });
    } catch (error) { next(error); }
  },

  /**
   * PATCH /api/v1/leads/:id/assign
   * Assign lead to staff
   */
  assign: async (req, res, next) => {
    try {
      const lead = await leadService.assign(req.params.id, req.body.userId);
      res.status(200).json({ success: true, data: lead });
    } catch (error) { next(error); }
  },

  /**
   * POST /api/v1/leads/:id/convert
   * Convert lead to customer
   */
  convert: async (req, res, next) => {
    try {
      const result = await leadService.convertToCustomer(req.params.id, { createdBy: req.userId });
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/leads/analytics
   * Get lead analytics
   */
  getAnalytics: async (req, res, next) => {
    try {
      const analytics = await leadService.getAnalytics(req.query);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) { next(error); }
  },
};

module.exports = leadController;
