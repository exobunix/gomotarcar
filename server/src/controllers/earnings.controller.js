const earningsService = require('../services/earnings.service');

const earningsController = {
  recordTaskEarnings: async (req, res, next) => {
    try {
      const earnings = await earningsService.recordTaskEarnings(req.params.taskId);
      res.status(201).json({ success: true, data: earnings });
    } catch (error) { next(error); }
  },

  calculatePeriodEarnings: async (req, res, next) => {
    try {
      const earnings = await earningsService.calculatePeriodEarnings(req.body.cleanerId, req.body);
      res.status(201).json({ success: true, data: earnings });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await earningsService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const earnings = await earningsService.getById(req.params.id);
      res.status(200).json({ success: true, data: earnings });
    } catch (error) { next(error); }
  },

  getCleanerSummary: async (req, res, next) => {
    try {
      const summary = await earningsService.getCleanerSummary(req.params.cleanerId);
      res.status(200).json({ success: true, data: summary });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await earningsService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = earningsController;
