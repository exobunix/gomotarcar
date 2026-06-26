const { CleanerLiveLocation, TrackingHistory } = require('../models/Tracking');
const { calculateDistance, isWithinRadius, isWithinZone } = require('../utils/geo');
const Zone = require('../models/Zone');

module.exports = (io, socket) => {
  // Cleaner sends live location update
  socket.on('location:update', async (data) => {
    try {
      const { lat, lng, speed, heading, accuracy, batteryLevel, currentTaskId } = data;

      const update = {
        location: { type: 'Point', coordinates: [lng, lat] },
        isOnline: true,
        lastUpdated: new Date(),
      };
      if (speed !== undefined) update.speed = speed;
      if (heading !== undefined) update.heading = heading;
      if (accuracy !== undefined) update.accuracy = accuracy;
      if (batteryLevel !== undefined) update.batteryLevel = batteryLevel;
      if (currentTaskId !== undefined) update.currentTaskId = currentTaskId;

      // Update live location
      await CleanerLiveLocation.findOneAndUpdate(
        { cleanerId: socket.cleanerId },
        { $set: update },
        { upsert: true, new: true }
      );

      // Record to history (every 30 seconds)
      const shouldRecord = !socket._lastHistoryRecord ||
        (Date.now() - socket._lastHistoryRecord) > 30000;

      if (shouldRecord) {
        await TrackingHistory.create({
          cleanerId: socket.cleanerId,
          taskId: currentTaskId,
          type: 'location_update',
          location: { type: 'Point', coordinates: [lng, lat] },
          speed, heading, accuracy, batteryLevel,
        });
        socket._lastHistoryRecord = Date.now();
      }

      // Broadcast to supervisors watching the cleaner
      socket.to(`cleaner:${socket.cleanerId}`).emit('location:updated', {
        cleanerId: socket.cleanerId,
        lat, lng, speed, heading, accuracy, batteryLevel,
        timestamp: new Date(),
      });

      // Check geofence alerts
      if (socket.assignedZone) {
        const zone = await Zone.findById(socket.assignedZone);
        if (zone?.boundary) {
          const point = { coordinates: [lng, lat] };
          const inside = isWithinZone(point, zone.boundary);
          if (!inside) {
            io.to(`zone:${socket.assignedZone}`).emit('geofence:alert', {
              cleanerId: socket.cleanerId,
              lat, lng,
              zoneName: zone.name,
              timestamp: new Date(),
            });
          }
        }
      }
    } catch (error) {
      socket.emit('error', { code: 'LOCATION_UPDATE_FAILED', message: error.message });
    }
  });

  // Supervisor subscribes to a cleaner's location
  socket.on('location:subscribe', (cleanerId) => {
    socket.join(`cleaner:${cleanerId}`);
  });

  // Supervisor unsubscribes from a cleaner's location
  socket.on('location:unsubscribe', (cleanerId) => {
    socket.leave(`cleaner:${cleanerId}`);
  });

  // Supervisor requests bulk locations for their zone
  socket.on('location:get-zone', async (zoneId) => {
    try {
      const cleaners = await CleanerLiveLocation.find({
        assignedZone: zoneId,
        isOnline: true,
      }).populate('cleanerId', 'firstName lastName cleanerId');
      socket.emit('location:zone-data', cleaners);
    } catch (error) {
      socket.emit('error', { code: 'ZONE_LOCATIONS_FAILED', message: error.message });
    }
  });

  // Cleaner sets offline
  socket.on('location:offline', async () => {
    try {
      await CleanerLiveLocation.findOneAndUpdate(
        { cleanerId: socket.cleanerId },
        { isOnline: false, lastUpdated: new Date() }
      );
      socket.broadcast.emit('cleaner:offline', {
        cleanerId: socket.cleanerId,
        timestamp: new Date(),
      });
    } catch (error) {
      socket.emit('error', { code: 'OFFLINE_FAILED', message: error.message });
    }
  });
};
