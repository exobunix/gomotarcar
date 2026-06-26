const incentiveService = require('../services/incentive.service');

const incentiveController = {
  calculateMonthly: async (req, res, next) => {
    try {
      const { cleanerId, month, year } = req.body;
      const incentive = await incentiveService.calculateMonthly(cleanerId, month, year);
      res.status(200).json({ success: true, data: incentive });
    } catch (error) { next(error); }
  },

  calculateAllMonthly: async (req, res, next) => {
    try {
      const { month, year } = req.body;
      const result = await incentiveService.calculateAllMonthly(month, year);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await incentiveService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const incentive = await incentiveService.getById(req.params.id);
      res.status(200).json({ success: true, data: incentive });
    } catch (error) { next(error); }
  },

  getCleanerMonth: async (req, res, next) => {
    try {
      const { cleanerId, month, year } = req.params;
      const incentive = await incentiveService.getCleanerMonth(cleanerId, parseInt(month), parseInt(year));
      res.status(200).json({ success: true, data: incentive || { message: 'No incentive record for this month' } });
    } catch (error) { next(error); }
  },

  markAsPaid: async (req, res, next) => {
    try {
      const { payoutId } = req.body;
      const incentive = await incentiveService.markAsPaid(req.params.id, payoutId);
      res.status(200).json({ success: true, data: incentive });
    } catch (error) { next(error); }
  },

  getLeaderboard: async (req, res, next) => {
    try {
      const leaderboard = await incentiveService.getLeaderboard(req.query);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await incentiveService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = incentiveController;
