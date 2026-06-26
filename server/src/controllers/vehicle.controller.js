const vehicleService = require('../services/vehicle.service');

const vehicleController = {
  /**
   * POST /api/v1/vehicles
   * Register a new vehicle
   */
  create: async (req, res, next) => {
    try {
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/vehicles
   * List all vehicles (admin)
   */
  list: async (req, res, next) => {
    try {
      const result = await vehicleService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/vehicles/:id
   * Get vehicle by ID
   */
  getById: async (req, res, next) => {
    try {
      const vehicle = await vehicleService.getById(req.params.id);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/vehicles/number/:vehicleNumber
   * Get vehicle by registration number
   */
  getByNumber: async (req, res, next) => {
    try {
      const vehicle = await vehicleService.getByVehicleNumber(req.params.vehicleNumber);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/vehicles/customer/:customerId
   * List vehicles for a customer
   */
  listByCustomer: async (req, res, next) => {
    try {
      const result = await vehicleService.listByCustomer(
        req.params.customerId, req.query
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/v1/vehicles/:id
   * Update vehicle
   */
  update: async (req, res, next) => {
    try {
      const vehicle = await vehicleService.update(req.params.id, req.body);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/vehicles/:id/deactivate
   * Deactivate vehicle (soft delete)
   */
  deactivate: async (req, res, next) => {
    try {
      const vehicle = await vehicleService.deactivate(req.params.id);
      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/vehicles/:id
   * Delete vehicle permanently
   */
  delete: async (req, res, next) => {
    try {
      const result = await vehicleService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/vehicles/stats
   * Get vehicle dashboard stats
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await vehicleService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = vehicleController;
