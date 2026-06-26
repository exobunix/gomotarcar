const geoService = require('../services/geo.service');
const routeOptimizationService = require('../services/route-optimization.service');

const trackingController = {
  updateLocation: async (req, res, next) => {
    try {
      const location = await geoService.updateCleanerLocation(req.params.cleanerId, req.body);
      // Also record to history
      await geoService.recordLocationHistory(req.params.cleanerId, req.body);
      res.status(200).json({ success: true, data: location });
    } catch (error) { next(error); }
  },

  getLiveLocation: async (req, res, next) => {
    try {
      const { CleanerLiveLocation } = require('../models/Tracking');
      const location = await CleanerLiveLocation.findOne({ cleanerId: req.params.cleanerId })
        .populate('cleanerId', 'firstName lastName cleanerId photo');
      if (!location) {
        return res.status(200).json({ success: true, data: { isOnline: false, message: 'Cleaner not found or offline' } });
      }
      res.status(200).json({ success: true, data: location });
    } catch (error) { next(error); }
  },

  getLocationHistory: async (req, res, next) => {
    try {
      const history = await geoService.getLocationHistory(req.params.cleanerId, req.query);
      res.status(200).json({ success: true, data: history });
    } catch (error) { next(error); }
  },

  setOffline: async (req, res, next) => {
    try {
      const result = await geoService.setCleanerOffline(req.params.cleanerId);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  findNearest: async (req, res, next) => {
    try {
      const cleaners = await geoService.findNearestCleaners(req.query);
      res.status(200).json({ success: true, data: cleaners });
    } catch (error) { next(error); }
  },

  findNearbyZones: async (req, res, next) => {
    try {
      const zones = await geoService.findNearbyZones(req.query);
      res.status(200).json({ success: true, data: zones });
    } catch (error) { next(error); }
  },

  verifyGPS: async (req, res, next) => {
    try {
      const result = await geoService.verifyGPS(req.params.cleanerId, req.body, req.query.radius);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  checkGeofence: async (req, res, next) => {
    try {
      const result = await geoService.checkGeofence(req.params.zoneId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  // Route optimization
  findOptimalCleaner: async (req, res, next) => {
    try {
      const result = await routeOptimizationService.findOptimalCleaner(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  optimizeRoute: async (req, res, next) => {
    try {
      const result = await routeOptimizationService.optimizeRoute(req.params.cleanerId, req.query.date);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  estimateTravelTime: async (req, res, next) => {
    try {
      const result = routeOptimizationService.estimateTravelTime(req.body.distanceMeters, req.body.averageSpeedKmh);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getAllOnlineCleaners: async (req, res, next) => {
    try {
      const { CleanerLiveLocation } = require('../models/Tracking');
      const cleaners = await CleanerLiveLocation.find({ isOnline: true })
        .populate('cleanerId', 'firstName lastName cleanerId photo stats')
        .sort({ lastUpdated: -1 });
      res.status(200).json({ success: true, data: cleaners });
    } catch (error) { next(error); }
  },
};

module.exports = trackingController;
