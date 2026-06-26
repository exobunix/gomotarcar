const Attendance = require('../models/Attendance');

module.exports = (io, socket) => {
  // Cleaner checks in
  socket.on('attendance:checkin', async (data) => {
    try {
      const { location, address, selfieUrl, deviceId } = data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const lateThreshold = 8 * 60 + 30; // 8:30 AM
      const isLate = currentMinutes > lateThreshold;
      const lateMinutes = isLate ? currentMinutes - lateThreshold : 0;

      const attendance = await Attendance.findOneAndUpdate(
        { cleanerId: socket.cleanerId, date: { $gte: today, $lt: tomorrow } },
        {
          $set: {
            cleanerId: socket.cleanerId,
            date: today,
            'checkIn.time': now,
            'checkIn.location': location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
            'checkIn.address': address,
            'checkIn.selfieUrl': selfieUrl,
            'checkIn.isLate': isLate,
            'checkIn.lateMinutes': lateMinutes,
            'checkIn.deviceId': deviceId,
            status: isLate ? 'late' : 'present',
          },
        },
        { upsert: true, new: true }
      );

      socket.emit('attendance:checkin-confirmed', {
        attendanceId: attendance._id,
        status: attendance.status,
        checkInTime: now,
        isLate,
        lateMinutes,
      });

      // Notify supervisor
      socket.broadcast.emit('attendance:checkin', {
        cleanerId: socket.cleanerId,
        status: attendance.status,
        timestamp: now,
      });
    } catch (error) {
      socket.emit('error', { code: 'CHECKIN_FAILED', message: error.message });
    }
  });

  // Cleaner checks out
  socket.on('attendance:checkout', async (data) => {
    try {
      const { location, address, selfieUrl } = data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendance = await Attendance.findOne({
        cleanerId: socket.cleanerId,
        date: { $gte: today, $lt: tomorrow },
      });

      if (!attendance) {
        return socket.emit('error', { code: 'NO_CHECKIN', message: 'No check-in found for today' });
      }

      const now = new Date();
      const workingMinutes = Math.round((now - new Date(attendance.checkIn.time)) / 60000);
      const earlyThreshold = 18 * 60;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const isEarly = currentMinutes < earlyThreshold;
      const earlyMinutes = isEarly ? earlyThreshold - currentMinutes : 0;

      attendance.checkOut = {
        time: now,
        location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
        address,
        selfieUrl,
        isEarly,
        earlyMinutes,
      };
      attendance.summary.totalWorkingMinutes = workingMinutes;
      attendance.summary.effectiveWorkingMinutes = workingMinutes;
      if (workingMinutes < 240) attendance.status = 'half-day';
      await attendance.save();

      socket.emit('attendance:checkout-confirmed', {
        attendanceId: attendance._id,
        status: attendance.status,
        checkOutTime: now,
        workingMinutes,
        isEarly,
      });

      socket.broadcast.emit('attendance:checkout', {
        cleanerId: socket.cleanerId,
        status: attendance.status,
        workingMinutes,
        timestamp: now,
      });
    } catch (error) {
      socket.emit('error', { code: 'CHECKOUT_FAILED', message: error.message });
    }
  });

  // Get today's attendance status
  socket.on('attendance:status', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendance = await Attendance.findOne({
        cleanerId: socket.cleanerId,
        date: { $gte: today, $lt: tomorrow },
      });

      socket.emit('attendance:status-data', attendance || { status: 'no_record' });
    } catch (error) {
      socket.emit('error', { code: 'ATT_STATUS_FAILED', message: error.message });
    }
  });
};
