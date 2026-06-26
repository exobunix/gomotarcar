const Zone = require('../models/Zone');
const Cleaner = require('../models/Cleaner');
const { CleanerLiveLocation } = require('../models/Tracking');
const { calculateDistance, isWithinRadius, isWithinZone } = require('../utils/geo');
const { AppError } = require('../middleware/errorHandler');

class GeoService {
  /**
   * Maximum plausible speed in km/h for GPS spoofing detection
   */
  static MAX_PLAUSIBLE_SPEED_KMH = 120;
  static MIN_ACCURACY_METERS = 500; // Reject locations with accuracy worse than 500m
  static TELEPORTATION_MINUTES = 2; // Time window for teleportation check
  static TELEPORTATION_DISTANCE_METERS = 5000; // Max plausible distance in 2 minutes

  /**
   * Verify if a cleaner is within allowed radius of a location
   * with GPS spoofing detection
   */
  async verifyGPS(cleanerId, { lat, lng, accuracy }, allowedRadiusMeters = 100) {
    // GPS spoofing check: reject low-accuracy locations
    if (accuracy !== undefined && accuracy > GeoService.MIN_ACCURACY_METERS) {
      throw new AppError(
        `Location accuracy (${Math.round(accuracy)}m) is too low. Required: < ${GeoService.MIN_ACCURACY_METERS}m`,
        400,
        'GEO_LOW_ACCURACY'
      );
    }

    const location = await CleanerLiveLocation.findOne({ cleanerId });
    if (!location) {
      throw new AppError('Cleaner location not available', 400, 'GEO_NO_LOCATION');
    }

    const [cleanerLng, cleanerLat] = location.location.coordinates;
    const distance = calculateDistance(cleanerLat, cleanerLng, lat, lng);

    return {
      verified: distance <= allowedRadiusMeters,
      distance: Math.round(distance),
      allowedRadius: allowedRadiusMeters,
    };
  }

  /**
   * Detect GPS spoofing by checking speed, teleportation, and accuracy
   */
  async detectSpoofing(cleanerId, { lat, lng, speed, accuracy }) {
    const issues = [];

    // 1. Check location history for speed-based spoofing
    if (speed !== undefined && speed > GeoService.MAX_PLAUSIBLE_SPEED_KMH) {
      issues.push({
        type: 'impossible_speed',
        severity: 'high',
        message: `Speed ${speed} km/h exceeds max plausible ${GeoService.MAX_PLAUSIBLE_SPEED_KMH} km/h`,
      });
    }

    // 2. Check accuracy threshold
    if (accuracy !== undefined && accuracy > GeoService.MIN_ACCURACY_METERS) {
      issues.push({
        type: 'low_accuracy',
        severity: 'medium',
        message: `GPS accuracy ${Math.round(accuracy)}m exceeds threshold ${GeoService.MIN_ACCURACY_METERS}m`,
      });
    }

    // 3. Teleportation detection — compare with last known location
    const lastLocation = await CleanerLiveLocation.findOne({ cleanerId });
    if (lastLocation && lastLocation.location?.coordinates) {
      const [lastLng, lastLat] = lastLocation.location.coordinates;
      const distanceMeters = calculateDistance(lastLat, lastLng, lat, lng);

      const timeDiff = lastLocation.lastUpdated
        ? (Date.now() - new Date(lastLocation.lastUpdated).getTime()) / 60000
        : Infinity;

      if (timeDiff < GeoService.TELEPORTATION_MINUTES && distanceMeters > GeoService.TELEPORTATION_DISTANCE_METERS) {
        issues.push({
          type: 'teleportation',
          severity: 'high',
          message: `Moved ${Math.round(distanceMeters)}m in ${Math.round(timeDiff)}min (max plausible: ${GeoService.TELEPORTATION_DISTANCE_METERS}m)`,
          distanceMeters: Math.round(distanceMeters),
          timeMinutes: Math.round(timeDiff * 10) / 10,
        });
      }
    }

    return {
      isSuspicious: issues.length > 0,
      issues,
      riskLevel: issues.some(i => i.severity === 'high') ? 'high' : issues.length > 0 ? 'medium' : 'low',
    };
  }

  /**
   * Update cleaner live location with spoofing detection
   */
  async updateCleanerLocation(cleanerId, { lat, lng, speed, heading, accuracy, batteryLevel, currentTaskId, assignedZone }) {
    // Run spoofing detection
    const spoofingCheck = await this.detectSpoofing(cleanerId, { lat, lng, speed, accuracy });

    // Allow update even if suspicious, but flag it
    const update = {
      location: { type: 'Point', coordinates: [lng, lat] },
      isOnline: true,
      lastUpdated: new Date(),
      spoofingFlag: spoofingCheck.isSuspicious ? spoofingCheck.riskLevel : 'clean',
      spoofingIssues: spoofingCheck.issues || [],
    };
    if (speed !== undefined) update.speed = speed;
    if (heading !== undefined) update.heading = heading;
    if (accuracy !== undefined) update.accuracy = accuracy;
    if (batteryLevel !== undefined) update.batteryLevel = batteryLevel;
    if (currentTaskId !== undefined) update.currentTaskId = currentTaskId;
    if (assignedZone !== undefined) update.assignedZone = assignedZone;

    const updated = await CleanerLiveLocation.findOneAndUpdate(
      { cleanerId },
      { $set: update },
      { upsert: true, new: true }
    );

    // If high risk spoofing detected, emit alert
    if (spoofingCheck.riskLevel === 'high') {
      const { emitToZone } = require('../socket');
      try {
        const cleaner = await Cleaner.findById(cleanerId).select('assignedZone');
        if (cleaner?.assignedZone) {
          emitToZone(cleaner.assignedZone, 'gps:spoofing-alert', {
            cleanerId,
            issues: spoofingCheck.issues,
            timestamp: new Date(),
          });
        }
      } catch (e) {
        // Socket emit is non-critical
      }
    }

    return updated;
  }

  /**
   * Check if a point is within a geofence zone
   */
  async checkGeofence(zoneId, { lat, lng }) {
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      throw new AppError('Zone not found', 404, 'GEO_ZONE_NOT_FOUND');
    }

    const point = { coordinates: [lng, lat] };
    const inside = isWithinZone(point, zone.boundary);

    const centerDistance = zone.center
      ? calculateDistance(zone.center.coordinates[1], zone.center.coordinates[0], lat, lng)
      : 0;

    return {
      inside,
      distanceFromCenter: Math.round(centerDistance),
      zoneName: zone.name,
    };
  }

  /**
   * Find nearest available cleaners to a location
   */
  async findNearestCleaners({ lat, lng, maxDistance = 5000, limit = 10, zoneId, excludeCleanerId } = {}) {
    const query = {
      isOnline: true,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    };

    if (zoneId) query.assignedZone = zoneId;
    if (excludeCleanerId) query.cleanerId = { $ne: excludeCleanerId };

    const locations = await CleanerLiveLocation.find(query)
      .populate('cleanerId', 'firstName lastName cleanerId stats')
      .limit(limit);

    return locations.map(loc => {
      const [locLng, locLat] = loc.location.coordinates;
      return {
        cleanerId: loc.cleanerId._id,
        name: `${loc.cleanerId.firstName} ${loc.cleanerId.lastName || ''}`.trim(),
        cleanerIdCode: loc.cleanerId.cleanerId,
        distance: Math.round(calculateDistance(lat, lng, locLat, locLng)),
        location: { lat: locLat, lng: locLng },
        stats: loc.cleanerId.stats,
        lastUpdated: loc.lastUpdated,
      };
    });
  }

  /**
   * Set cleaner offline
   */
  async setCleanerOffline(cleanerId) {
    return CleanerLiveLocation.findOneAndUpdate(
      { cleanerId },
      { isOnline: false, lastUpdated: new Date() },
      { new: true }
    );
  }

  /**
   * Get nearby zones for a location
   */
  async findNearbyZones({ lat, lng, maxDistance = 10000 } = {}) {
    const zones = await Zone.find({
      center: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
      isActive: true,
    }).limit(20);

    return zones.map(zone => {
      const [zoneLng, zoneLat] = zone.center?.coordinates || [0, 0];
      return {
        _id: zone._id,
        name: zone.name,
        city: zone.city,
        distance: Math.round(calculateDistance(lat, lng, zoneLat, zoneLng)),
        activeCleaners: zone.activeCleaners,
        activeTasks: zone.activeTasks,
      };
    });
  }

  /**
   * Get location history for a cleaner
   */
  async getLocationHistory(cleanerId, { fromDate, toDate, limit = 100 } = {}) {
    const { TrackingHistory } = require('../models/Tracking');
    const query = { cleanerId };

    if (fromDate || toDate) {
      query.timestamp = {};
      if (fromDate) query.timestamp.$gte = new Date(fromDate);
      if (toDate) query.timestamp.$lte = new Date(toDate);
    }

    return TrackingHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  /**
   * Record a location history point
   */
  async recordLocationHistory(cleanerId, data) {
    const { TrackingHistory } = require('../models/Tracking');
    return TrackingHistory.create({
      cleanerId,
      taskId: data.taskId,
      type: data.type || 'location_update',
      location: { type: 'Point', coordinates: [data.lng, data.lat] },
      speed: data.speed,
      heading: data.heading,
      accuracy: data.accuracy,
      batteryLevel: data.batteryLevel,
      timestamp: new Date(),
    });
  }
}

module.exports = new GeoService();
