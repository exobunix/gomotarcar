const analyticsService = require('../services/analytics.service');

const analyticsController = {
  getDashboard: async (req, res, next) => {
    try {
      const { startDate, endDate, period } = req.query;
      const metrics = await analyticsService.getDashboardMetrics({ startDate, endDate, period });
      res.status(200).json({ success: true, data: metrics });
    } catch (error) { next(error); }
  },

  getRevenueReport: async (req, res, next) => {
    try {
      const { startDate, endDate, groupBy } = req.query;
      const report = await analyticsService.getRevenueReport({ startDate, endDate, groupBy });
      res.status(200).json({ success: true, data: report });
    } catch (error) { next(error); }
  },

  getCleanerProductivity: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await analyticsService.getCleanerProductivity({ startDate, endDate });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  async getExport(req, res, next) {
    try {
      const { type, startDate, endDate, format = 'json' } = req.query;
      const data = await analyticsService.getExportData({ type, startDate, endDate });
      if (format === 'csv') {
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-export.csv`);
        return res.status(200).send(csv);
      }
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  },
};

module.exports = analyticsController;
