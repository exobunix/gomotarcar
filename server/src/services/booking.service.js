const ServiceBooking = require('../models/ServiceBooking');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const { generateBookingId } = require('../utils/helpers');
const slotService = require('./slot.service');

const socketEmitter = require('../socket/emitter');

class BookingService {
  /**
   * Create a new booking with double-booking prevention
   */
  async create(data, idempotencyKey) {
    const { customerId, vehicleId, categoryId, serviceName, providerId,
      franchiseId, slotDate, slotTime, serviceMode, basePrice, discount } = data;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) throw new AppError('Vehicle not found', 404, 'BOOKING_VEHICLE_NOT_FOUND');
    if (!vehicle.isActive) throw new AppError('Vehicle is not active', 400, 'BOOKING_VEHICLE_INACTIVE');

    // Idempotency check — if idempotency key provided and booking already exists
    if (idempotencyKey) {
      const existing = await ServiceBooking.findOne({ bookingId: idempotencyKey });
      if (existing) {
        return existing.populate('vehicleId', 'vehicleNumber make model');
      }
    }

    // Double-booking prevention
    if (slotDate) {
      await slotService.preventDoubleBooking({
        vehicleId, slotDate, slotTime, customerId,
      });
    }

    const totalAmount = (basePrice || 0) - (discount || 0);
    const bookingId = idempotencyKey || generateBookingId();

    const booking = await ServiceBooking.create({
      bookingId, customerId, vehicleId, categoryId, serviceName,
      providerId, franchiseId, slotDate, slotTime,
      serviceMode: serviceMode || 'workshop', basePrice: basePrice || 0,
      discount: discount || 0, totalAmount,
      status: 'booked',
      trackingTimeline: [{ status: 'booked', timestamp: new Date(), note: 'Booking created' }],
    });

    // Update customer stats
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalBookings: 1 },
    });

    // Emit real-time event
    socketEmitter.emitBookingCreated(booking, customerId, franchiseId);

    return booking.populate('vehicleId', 'vehicleNumber make model');
  }

  /**
   * Get booking by ID
   */
  async getById(bookingId) {
    const booking = await ServiceBooking.findById(bookingId)
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model color vehicleType')
      .populate('franchiseId', 'franchiseName ownerName')
      .populate('providerId', 'name');
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    return booking;
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId, status, note) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    const previousStatus = booking.status;
    booking.status = status;
    booking.trackingTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`,
    });

    if (status === 'completed') {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, {
        $inc: { totalCleanings: 1 },
        lastCleaning: new Date(),
      });
    }

    await booking.save();

    // Emit real-time events
    socketEmitter.emitBookingStatusChanged(booking, previousStatus);
    socketEmitter.emitDashboardUpdate({ type: 'booking_status', bookingId: booking._id, status });

    return booking;
  }

  /**
   * Assign cleaner to booking
   */
  async assignCleaner(bookingId, cleanerId) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    booking.assignedTo = cleanerId;
    booking.status = 'assigned';
    await booking.save();
    socketEmitter.emitBookingAssigned(booking, cleanerId);
    socketEmitter.emitDashboardUpdate({ type: 'booking_assigned', bookingId: booking._id, cleanerId });
    return booking;
  }

  /**
   * Add extra charge to booking
   */
  async addExtraCharge(bookingId, { item, amount }) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    booking.extraCharges.push({ item, amount, approved: false });
    booking.totalAmount = (booking.totalAmount || 0) + amount;
    await booking.save();
    return booking;
  }

  /**
   * Approve extra charge
   */
  async approveExtraCharge(bookingId, chargeId) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    const charge = booking.extraCharges.id(chargeId);
    if (!charge) throw new AppError('Extra charge not found', 404, 'BOOKING_CHARGE_NOT_FOUND');

    charge.approved = true;
    await booking.save();
    return booking;
  }

  /**
   * Generate job card
   */
  async generateJobCard(bookingId) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    booking.jobCard.generated = true;
    booking.status = 'job_card_pending';
    booking.trackingTimeline.push({
      status: 'job_card_pending',
      timestamp: new Date(),
      note: 'Job card generated',
    });
    await booking.save();
    return booking;
  }

  /**
   * List bookings
   */
  async list({ page = 1, limit = 20, status, customerId, vehicleId, franchiseId, fromDate, toDate, search, serviceType } = {}) {
    const query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (vehicleId) query.vehicleId = vehicleId;
    if (franchiseId) query.franchiseId = franchiseId;
    if (fromDate || toDate) {
      query.slotDate = {};
      if (fromDate) query.slotDate.$gte = new Date(fromDate);
      if (toDate) query.slotDate.$lte = new Date(toDate);
    }
    if (serviceType && serviceType !== 'All Services') {
      query.serviceName = { $regex: serviceType, $options: 'i' };
    }

    if (search) {
      const customers = await Customer.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      }, '_id');
      const customerIds = customers.map(c => c._id);

      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } },
        { customerId: { $in: customerIds } }
      ];
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      ServiceBooking.find(query)
        .populate({
          path: 'customerId',
          select: 'firstName lastName phone email defaultAddressId',
          populate: {
            path: 'defaultAddressId'
          }
        })
        .populate('vehicleId')
        .populate('franchiseId', 'franchiseName ownerName phone email address type')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      ServiceBooking.countDocuments(query),
    ]);

    return {
      data: bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Cancel booking
   */
  async cancel(bookingId, reason) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new AppError('Booking cannot be cancelled', 400, 'BOOKING_CANNOT_CANCEL');
    }

    booking.status = 'cancelled';
    booking.trackingTimeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled',
    });
    await booking.save();
    return booking;
  }

  /**
   * Add review
   */
  async addReview(bookingId, { rating, text }) {
    const booking = await ServiceBooking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    booking.reviewed = true;
    booking.customerRating = rating;
    booking.reviewText = text;
    await booking.save();
    return booking;
  }

  async getStats() {
    const latestBooking = await ServiceBooking.findOne().sort({ createdAt: -1 });
    const todayBase = latestBooking ? new Date(latestBooking.createdAt) : new Date();

    const todayStart = new Date(todayBase);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayBase);
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayEnd = new Date(todayEnd.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalToday,
      totalYesterday,
      todayCount,
      yesterdayCount,
      inProgressCount,
      inProgressYesterdayCount,
      completedToday,
      completedYesterday,
      bookingsToday,
      bookingsYesterday
    ] = await Promise.all([
      // Total Bookings till today
      ServiceBooking.countDocuments(),
      // Total Bookings till yesterday
      ServiceBooking.countDocuments({ createdAt: { $lte: yesterdayEnd } }),
      // Today's Bookings (created today)
      ServiceBooking.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      // Yesterday's Bookings (created yesterday)
      ServiceBooking.countDocuments({ createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } }),
      // In Progress (current)
      ServiceBooking.countDocuments({ status: 'in_progress' }),
      // In Progress Yesterday (number of bookings in_progress yesterday)
      ServiceBooking.countDocuments({ 
        $or: [
          { status: 'in_progress', createdAt: { $lte: yesterdayEnd } },
          { trackingTimeline: { $elemMatch: { status: 'in_progress', timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd } } } }
        ]
      }),
      // Completed Today
      ServiceBooking.countDocuments({
        status: 'completed',
        $or: [
          { trackingTimeline: { $elemMatch: { status: 'completed', timestamp: { $gte: todayStart, $lte: todayEnd } } } },
          { slotDate: { $gte: todayStart, $lte: todayEnd } }
        ]
      }),
      // Completed Yesterday
      ServiceBooking.countDocuments({
        status: 'completed',
        $or: [
          { trackingTimeline: { $elemMatch: { status: 'completed', timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd } } } },
          { slotDate: { $gte: yesterdayStart, $lte: yesterdayEnd } }
        ]
      }),
      // Bookings for Revenue Today
      ServiceBooking.find({
        status: 'completed',
        $or: [
          { trackingTimeline: { $elemMatch: { status: 'completed', timestamp: { $gte: todayStart, $lte: todayEnd } } } },
          { slotDate: { $gte: todayStart, $lte: todayEnd } }
        ]
      }, 'totalAmount'),
      // Bookings for Revenue Yesterday
      ServiceBooking.find({
        status: 'completed',
        $or: [
          { trackingTimeline: { $elemMatch: { status: 'completed', timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd } } } },
          { slotDate: { $gte: yesterdayStart, $lte: yesterdayEnd } }
        ]
      }, 'totalAmount')
    ]);

    const revenueToday = bookingsToday.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const revenueYesterday = bookingsYesterday.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const calcChange = (todayVal, yesterdayVal) => {
      if (!yesterdayVal) return todayVal > 0 ? 100 : 0;
      return parseFloat((((todayVal - yesterdayVal) / yesterdayVal) * 100).toFixed(1));
    };

    return {
      totalBookings: { value: totalToday, changePercent: calcChange(totalToday, totalYesterday) },
      todayBookings: { value: todayCount, changePercent: calcChange(todayCount, yesterdayCount) },
      inProgress: { value: inProgressCount, changePercent: calcChange(inProgressCount, inProgressYesterdayCount) },
      completedToday: { value: completedToday, changePercent: calcChange(completedToday, completedYesterday) },
      todayRevenue: { value: revenueToday, changePercent: calcChange(revenueToday, revenueYesterday) },
    };
  }
}

module.exports = new BookingService();
