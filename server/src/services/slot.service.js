const ServiceBooking = require('../models/ServiceBooking');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../middleware/errorHandler');

const SLOT_DURATION_MINUTES = 60; // Default slot duration
const MAX_BOOKINGS_PER_SLOT = 1; // Per vehicle per slot
const MAX_BOOKINGS_PER_CUSTOMER_PER_DAY = 2;

class SlotService {
  /**
   * Check if a slot is available for a vehicle at a given date/time
   */
  async checkSlotAvailability({ vehicleId, franchiseId, slotDate, slotTime }) {
    const targetDate = new Date(slotDate);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const query = {
      vehicleId,
      slotDate: { $gte: targetDate, $lt: endOfDay },
      status: { $nin: ['cancelled', 'completed'] },
    };
    if (slotTime) query.slotTime = slotTime;
    if (franchiseId) query.franchiseId = franchiseId;

    const existingBookings = await ServiceBooking.countDocuments(query);

    const isAvailable = existingBookings < MAX_BOOKINGS_PER_SLOT;

    return {
      isAvailable,
      existingBookings,
      maxPerSlot: MAX_BOOKINGS_PER_SLOT,
      message: isAvailable ? 'Slot is available' : 'Slot is already booked',
    };
  }

  /**
   * Get available slots for a vehicle on a given date
   */
  async getAvailableSlots({ vehicleId, franchiseId, date }) {
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new AppError('Invalid date format', 400, 'SLOT_INVALID_DATE');
    }

    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // All possible time slots (30-min intervals from 8 AM to 6 PM)
    const allSlots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        allSlots.push(timeStr);
      }
    }

    // Get booked slots for this vehicle and franchise
    const matchQuery = {
      vehicleId,
      slotDate: { $gte: targetDate, $lt: endOfDay },
      status: { $nin: ['cancelled', 'completed'] },
    };
    if (franchiseId) matchQuery.franchiseId = franchiseId;

    const bookings = await ServiceBooking.find(matchQuery).select('slotTime');

    const bookedTimes = new Set(bookings.map(b => b.slotTime));

    // Check for existing tasks on this date
    const tasks = await Task.find({
      vehicleId,
      scheduledDate: { $gte: targetDate, $lt: endOfDay },
      status: { $nin: ['missed', 'cancelled'] },
    }).select('scheduledTime timeSlot');

    tasks.forEach(t => {
      if (t.scheduledTime) bookedTimes.add(t.scheduledTime);
    });

    const availableSlots = allSlots.map(time => ({
      time,
      available: !bookedTimes.has(time),
      label: this._formatTimeLabel(time),
    }));

    return {
      date: targetDate.toISOString().split('T')[0],
      totalSlots: allSlots.length,
      availableCount: availableSlots.filter(s => s.available).length,
      slots: availableSlots,
    };
  }

  /**
   * Reserve a slot atomically using findOneAndUpdate
   */
  async reserveSlot({ vehicleId, slotDate, slotTime, customerId, franchiseId }) {
    const targetDate = new Date(slotDate);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Use atomic findOneAndUpdate to prevent race conditions
    // Only succeeds if no conflicting booking exists
    const existing = await ServiceBooking.findOne({
      vehicleId,
      slotDate: { $gte: targetDate, $lt: endOfDay },
      slotTime,
      status: { $nin: ['cancelled', 'completed'] },
    });

    if (existing) {
      throw new AppError(
        `Slot ${slotTime} on ${new Date(slotDate).toLocaleDateString()} is already booked`,
        409,
        'SLOT_UNAVAILABLE'
      );
    }

    return { reserved: true, slotDate, slotTime };
  }

  /**
   * Check for double-booking before creating a new booking
   */
  async preventDoubleBooking({ vehicleId, slotDate, slotTime, customerId }) {
    // Check vehicle slot
    const vehicleSlotCheck = await this.checkSlotAvailability({
      vehicleId, slotDate, slotTime,
    });

    if (!vehicleSlotCheck.isAvailable) {
      throw new AppError(
        `Vehicle already has a booking at ${slotTime} on the selected date`,
        409,
        'SLOT_VEHICLE_CONFLICT'
      );
    }

    // Check customer daily limit
    const targetDate = new Date(slotDate);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const customerBookingsToday = await ServiceBooking.countDocuments({
      customerId,
      slotDate: { $gte: targetDate, $lt: endOfDay },
      status: { $nin: ['cancelled'] },
    });

    if (customerBookingsToday >= MAX_BOOKINGS_PER_CUSTOMER_PER_DAY) {
      throw new AppError(
        `Maximum ${MAX_BOOKINGS_PER_CUSTOMER_PER_DAY} bookings per day exceeded`,
        429,
        'SLOT_CUSTOMER_DAILY_LIMIT'
      );
    }

    return { allowed: true };
  }

  /**
   * Format time label for display
   */
  _formatTimeLabel(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }

  /**
   * Get slot statistics for a franchise/date
   */
  async getSlotStats({ franchiseId, date } = {}) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const matchQuery = {
      slotDate: { $gte: targetDate, $lt: endOfDay },
      status: { $nin: ['cancelled'] },
    };
    if (franchiseId) matchQuery.franchiseId = franchiseId;

    const slots = await ServiceBooking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$slotTime',
          count: { $sum: 1 },
          statuses: { $addToSet: '$status' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalBookings = slots.reduce((sum, s) => sum + s.count, 0);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalSlotsBooked: totalBookings,
      peakHour: slots.length > 0 ? slots.reduce((a, b) => a.count > b.count ? a : b)._id : null,
      slots,
    };
  }
}

module.exports = new SlotService();
