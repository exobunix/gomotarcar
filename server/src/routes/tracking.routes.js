const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  updateLocationSchema, verifyGPSSchema, checkGeofenceSchema,
  findNearestSchema, findNearbyZonesSchema, optimizeRouteSchema,
  findOptimalCleanerSchema, estimateTravelTimeSchema,
  locationHistorySchema, cleanerIdParamSchema, zoneIdParamSchema,
} = require('../validators/tracking.validator');

router.use(authenticate);

// Live tracking (cleaner updates own location)
router.put('/cleaner/:cleanerId/location', authorize(roles.CLEANER, roles.SUPERVISOR, roles.MANAGER), validate(cleanerIdParamSchema, 'params'), validate(updateLocationSchema), trackingController.updateLocation);
router.post('/cleaner/:cleanerId/offline', authorize(roles.CLEANER, roles.SUPERVISOR, roles.MANAGER), validate(cleanerIdParamSchema, 'params'), trackingController.setOffline);

// Location queries
router.get('/online', trackingController.getAllOnlineCleaners);
router.get('/nearest', validate(findNearestSchema, 'query'), trackingController.findNearest);
router.get('/zones/nearby', validate(findNearbyZonesSchema, 'query'), trackingController.findNearbyZones);

// Cleaner-specific
router.get('/cleaner/:cleanerId/location', validate(cleanerIdParamSchema, 'params'), trackingController.getLiveLocation);
router.get('/cleaner/:cleanerId/history', validate(cleanerIdParamSchema, 'params'), validate(locationHistorySchema, 'query'), trackingController.getLocationHistory);

// Geo verification
router.post('/verify-gps/:cleanerId', authorize(roles.SUPERVISOR, roles.MANAGER), validate(cleanerIdParamSchema, 'params'), validate(verifyGPSSchema), trackingController.verifyGPS);
router.post('/check-geofence/:zoneId', validate(zoneIdParamSchema, 'params'), validate(checkGeofenceSchema), trackingController.checkGeofence);

// Route optimization
router.post('/optimal-cleaner', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(findOptimalCleanerSchema), trackingController.findOptimalCleaner);
router.get('/cleaner/:cleanerId/optimize-route', authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.SUPERVISOR), validate(cleanerIdParamSchema, 'params'), validate(optimizeRouteSchema, 'query'), trackingController.optimizeRoute);
router.post('/estimate-travel-time', validate(estimateTravelTimeSchema), trackingController.estimateTravelTime);

module.exports = router;
