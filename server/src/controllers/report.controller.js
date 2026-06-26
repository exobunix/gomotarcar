/**
 * GoMotarCar Report Controller
 */
const reportService = require('../services/report.service');

const reportController = {
  // GET /api/reports/summary?startDate=&endDate=
  getSummary: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportService.getSummaryReport({ startDate, endDate });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/reports/revenue?startDate=&endDate=&groupBy=month|day|year
  getRevenue: async (req, res, next) => {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      const data = await reportService.getRevenueReport({ startDate, endDate, groupBy });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/reports/bookings?startDate=&endDate=&groupBy=day|month|year
  getBookings: async (req, res, next) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      const data = await reportService.getBookingReport({ startDate, endDate, groupBy });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/reports/cleaners?startDate=&endDate=&sortBy=earnings|jobs|rating&limit=50
  getCleaners: async (req, res, next) => {
    try {
      const { startDate, endDate, sortBy = 'earnings', limit = 50 } = req.query;
      const data = await reportService.getCleanerReport({ startDate, endDate, sortBy, limit: parseInt(limit) });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/reports/customers?startDate=&endDate=&groupBy=day|month|year
  getCustomers: async (req, res, next) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;
      const data = await reportService.getCustomerReport({ startDate, endDate, groupBy });
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },

  // GET /api/reports/export/:reportType?startDate=&endDate=&format=csv|json
  getExport: async (req, res, next) => {
    try {
      const { reportType } = req.params;
      const { startDate, endDate, format = 'json' } = req.query;
      const data = await reportService.getExportData({ reportType, startDate, endDate });

      if (format === 'csv') {
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        const csvRows = [headers.join(','), ...data.map(row =>
          headers.map(h => {
            const val = row[h];
            const str = val instanceof Date ? val.toISOString() : String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          }).join(',')
        )];
        const csv = csvRows.join('\r\n');
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
        return res.status(200).send('\uFEFF' + csv);
      }

      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  },
};

module.exports = reportController;
