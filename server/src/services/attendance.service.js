const Attendance = require('../models/Attendance');
const Cleaner = require('../models/Cleaner');
const { AppError } = require('../middleware/errorHandler');

const socketEmitter = require('../socket/emitter');

class AttendanceService {
  /**
   * Check-in a cleaner with geofence validation
   */
  async checkIn(cleanerId, { location, address, selfieUrl, deviceId, ip } = {}) {
    const cleaner = await Cleaner.findById(cleanerId);
    if (!cleaner) throw new AppError('Cleaner not found', 404, 'ATT_CLEANER_NOT_FOUND');
    if (!cleaner.isActive) throw new AppError('Cleaner is not active', 400, 'ATT_CLEANER_INACTIVE');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in
    const existing = await Attendance.findOne({ cleanerId, date: { $gte: today, $lt: tomorrow } });
    if (existing) {
      if (existing.checkIn?.time) {
        throw new AppError('Already checked in today', 400, 'ATT_ALREADY_CHECKED_IN');
      }
    }

    // Geofence validation — verify cleaner is within their assigned zone
    if (cleaner.assignedZone && location?.lat && location?.lng) {
      try {
        const geoService = require('./geo.service');
        const zone = await require('../models/Zone').findById(cleaner.assignedZone);
        if (zone?.boundary) {
          const { isWithinZone } = require('../utils/geo');
          const point = { coordinates: [location.lng, location.lat] };
          const insideZone = isWithinZone(point, zone.boundary);
          if (!insideZone) {
            throw new AppError(
              'You are outside your assigned work zone. Check-in from your designated area.',
              403,
              'ATT_GEOFENCE_VIOLATION'
            );
          }
        }
      } catch (error) {
        // Only throw geofence errors, pass through other errors
        if (error.code === 'ATT_GEOFENCE_VIOLATION') throw error;
        // Log and continue if zone validation fails (non-critical)
        console.error('Geofence validation error:', error.message);
      }
    }

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Late check-in logic (after 8:30 AM)
    const lateThreshold = 8 * 60 + 30; // 8:30 AM in minutes
    const currentMinutes = hour * 60 + minutes;
    const isLate = currentMinutes > lateThreshold;
    const lateMinutes = isLate ? currentMinutes - lateThreshold : 0;

    const attendanceData = {
      cleanerId,
      date: today,
      checkIn: {
        time: now,
        location,
        address,
        selfieUrl,
        isLate,
        lateMinutes,
        ip,
        deviceId,
      },
      status: isLate ? 'late' : 'present',
    };

    const attendance = existing
      ? await Attendance.findByIdAndUpdate(existing._id, { $set: attendanceData }, { new: true })
      : await Attendance.create(attendanceData);

    socketEmitter.emitAttendanceCheckIn(attendance, cleanerId);
    return attendance;
  }

  /**
   * Check-out a cleaner
   */
  async checkOut(cleanerId, { location, address, selfieUrl } = {}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({ cleanerId, date: { $gte: today, $lt: tomorrow } });
    if (!attendance) throw new AppError('No check-in found for today', 400, 'ATT_NO_CHECKIN');
    if (attendance.checkOut?.time) throw new AppError('Already checked out today', 400, 'ATT_ALREADY_CHECKED_OUT');

    const now = new Date();
    const checkInTime = attendance.checkIn.time;
    const workingMinutes = Math.round((now - new Date(checkInTime)) / 60000);

    // Early check-out (before 6 PM = 18:00)
    const earlyThreshold = 18 * 60;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isEarly = currentMinutes < earlyThreshold;
    const earlyMinutes = isEarly ? earlyThreshold - currentMinutes : 0;

    attendance.checkOut = { time: now, location, address, selfieUrl, isEarly, earlyMinutes };
    attendance.summary.totalWorkingMinutes = workingMinutes;
    attendance.summary.effectiveWorkingMinutes = workingMinutes - (attendance.summary.breaks?.reduce((s, b) => s + (b.duration || 0), 0) || 0);

    // Half-day if < 4 hours
    if (workingMinutes < 240) {
      attendance.status = 'half-day';
    }

    await attendance.save();

    // Update cleaner attendance stats
    const totalAttendances = await Attendance.countDocuments({ cleanerId });
    const presentDays = await Attendance.countDocuments({ cleanerId, status: { $in: ['present', 'half-day', 'late'] } });
    const attendancePct = totalAttendances > 0 ? Math.round((presentDays / totalAttendances) * 100) : 0;
    await Cleaner.findByIdAndUpdate(cleanerId, { 'stats.attendancePercentage': attendancePct });

    socketEmitter.emitAttendanceCheckOut(attendance, cleanerId);
    return attendance;
  }

  /**
   * Mark absent (admin)
   */
  async markAbsent(cleanerId, date, { reason, modifiedBy } = {}) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({ cleanerId, date: { $gte: targetDate, $lt: endOfDay } });

    if (!attendance) {
      attendance = await Attendance.create({ cleanerId, date: targetDate, status: 'absent' });
    }

    attendance.status = 'absent';
    if (reason) attendance.modificationReason = reason;
    if (modifiedBy) attendance.modifiedBy = modifiedBy;
    await attendance.save();

    return attendance;
  }

  /**
   * Get attendance by ID
   */
  async getById(attendanceId) {
    const attendance = await Attendance.findById(attendanceId)
      .populate('cleanerId', 'firstName lastName cleanerId');
    if (!attendance) throw new AppError('Attendance not found', 404, 'ATT_NOT_FOUND');
    return attendance;
  }

  /**
   * Get today's attendance for a cleaner
   */
  async getToday(cleanerId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Attendance.findOne({ cleanerId, date: { $gte: today, $lt: tomorrow } });
  }

  /**
   * List attendance records
   */
  async list({ page = 1, limit = 20, cleanerId, status, fromDate, toDate } = {}) {
    const query = {};
    if (cleanerId) query.cleanerId = cleanerId;
    if (status) query.status = status;
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('cleanerId', 'firstName lastName cleanerId')
        .sort({ date: -1 }).skip(skip).limit(limit),
      Attendance.countDocuments(query),
    ]);

    return {
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Get monthly summary for a cleaner
   */
  async getMonthlySummary(cleanerId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      cleanerId,
      date: { $gte: startDate, $lte: endDate },
    });

    const summary = {
      present: 0, absent: 0, halfDay: 0, late: 0, leave: 0,
      totalWorkingMinutes: 0, totalOvertimeMinutes: 0,
    };

    records.forEach(r => {
      if (r.status === 'present') summary.present++;
      else if (r.status === 'absent') summary.absent++;
      else if (r.status === 'half-day') summary.halfDay++;
      else if (r.status === 'late') summary.late++;
      else if (r.status === 'leave') summary.leave++;

      summary.totalWorkingMinutes += r.summary?.effectiveWorkingMinutes || 0;
      summary.totalOvertimeMinutes += r.summary?.overtimeMinutes || 0;
    });

    return { month, year, cleanerId, records, summary };
  }

  /**
   * Get stats
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, todayPresent, todayAbsent, todayLate, todayHalfDay] = await Promise.all([
      Attendance.countDocuments(),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'present' }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'absent' }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'late' }),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'half-day' }),
    ]);

    return { total, todayPresent, todayAbsent, todayLate, todayHalfDay };
  }
}

module.exports = new AttendanceService();
