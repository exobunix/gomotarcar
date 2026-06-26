const attendanceService = require('../services/attendance.service');
const Cleaner = require('../models/Cleaner');

const _resolveCleanerId = async (userId) => {
  const cleaner = await Cleaner.findOne({ userId });
  if (!cleaner) throw new Error('Cleaner profile not found for the authenticated user');
  return cleaner._id;
};

const attendanceController = {
  checkIn: async (req, res, next) => {
    try {
      const cleanerId = await _resolveCleanerId(req.userId);
      const attendance = await attendanceService.checkIn(cleanerId, req.body);
      res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
  },

  checkOut: async (req, res, next) => {
    try {
      const cleanerId = await _resolveCleanerId(req.userId);
      const attendance = await attendanceService.checkOut(cleanerId, req.body);
      res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
  },

  markAbsent: async (req, res, next) => {
    try {
      const { date, reason } = req.body;
      const attendance = await attendanceService.markAbsent(req.params.id, date, { reason, modifiedBy: req.userId });
      res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await attendanceService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const attendance = await attendanceService.getById(req.params.id);
      res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
  },

  getToday: async (req, res, next) => {
    try {
      const attendance = await attendanceService.getToday(req.params.cleanerId);
      res.status(200).json({ success: true, data: attendance || { status: 'no_record' } });
    } catch (error) { next(error); }
  },

  getMonthlySummary: async (req, res, next) => {
    try {
      const { cleanerId, month, year } = req.params;
      const summary = await attendanceService.getMonthlySummary(cleanerId, parseInt(month), parseInt(year));
      res.status(200).json({ success: true, data: summary });
    } catch (error) { next(error); }
  },

  checkInForCleaner: async (req, res, next) => {
    try {
      const attendance = await attendanceService.checkIn(req.params.cleanerId, req.body);
      res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
  },

  checkOutForCleaner: async (req, res, next) => {
    try {
      const attendance = await attendanceService.checkOut(req.params.cleanerId, req.body);
      res.status(200).json({ success: true, data: attendance });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await attendanceService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },
};

module.exports = attendanceController;
