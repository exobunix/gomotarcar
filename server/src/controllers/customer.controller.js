const customerService = require('../services/customer.service');

const customerController = {
  getProfile: async (req, res, next) => {
    try {
      const customer = await customerService.getProfile(req.userId);
      res.status(200).json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  updateProfile: async (req, res, next) => {
    try {
      const customer = await customerService.updateProfile(req.userId, req.body);
      res.status(200).json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  getMyBookings: async (req, res, next) => {
    try {
      const bookings = await customerService.getMyBookings(req.userId);
      res.status(200).json({ success: true, data: bookings });
    } catch (error) { next(error); }
  },

  getMyVehicles: async (req, res, next) => {
    try {
      const vehicles = await customerService.getMyVehicles(req.userId);
      res.status(200).json({ success: true, data: vehicles });
    } catch (error) { next(error); }
  },

  addVehicle: async (req, res, next) => {
    try {
      const vehicle = await customerService.addVehicle(req.userId, req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await customerService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await customerService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const customer = await customerService.getById(req.params.id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  update: async (req, res, next) => {
    try {
      const customer = await customerService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  create: async (req, res, next) => {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (error) { next(error); }
  },

  deactivate: async (req, res, next) => {
    try {
      const result = await customerService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },
};

module.exports = customerController;
