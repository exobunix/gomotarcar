const ServiceBooking = require('../models/ServiceBooking');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Franchise = require('../models/Franchise');
const { AppError } = require('../middleware/errorHandler');
const { generateInvoiceNumber } = require('../utils/helpers');

class InvoiceService {
  /**
   * Generate invoice for a completed booking
   */
  async generate(bookingId) {
    const booking = await ServiceBooking.findById(bookingId)
      .populate('customerId', 'firstName lastName phone email address')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('franchiseId', 'franchiseName ownerName address gstNumber');
    
    if (!booking) throw new AppError('Booking not found', 404, 'INV_BOOKING_NOT_FOUND');
    if (booking.status !== 'completed') throw new AppError('Booking must be completed first', 400, 'INV_BOOKING_NOT_COMPLETED');
    if (booking.invoice?.generated) return booking; // Already generated

    // Calculate amounts
    const baseAmount = booking.totalAmount || 0;
    const extraChargesTotal = (booking.extraCharges || [])
      .filter(c => c.approved)
      .reduce((sum, c) => sum + c.amount, 0);
    const subtotal = baseAmount + extraChargesTotal;
    const gstPercent = 18;
    const gstAmount = Math.round(subtotal * (gstPercent / 100));
    const grandTotal = subtotal + gstAmount;

    // Get payment info
    const payment = await Payment.findOne({
      referenceType: 'booking',
      referenceId: booking._id,
      status: 'captured',
    });

    const invoiceNumber = generateInvoiceNumber();

    booking.invoice = {
      invoiceNumber,
      generated: true,
      generatedAt: new Date(),
      baseAmount,
      extraCharges: booking.extraCharges.filter(c => c.approved),
      extraChargesTotal,
      subtotal,
      gstPercent,
      gstAmount,
      grandTotal,
      paymentId: payment?._id,
      paymentStatus: payment?.status || 'pending',
      breakdown: {
        serviceCharge: baseAmount,
        extraCharges: extraChargesTotal,
        gst: gstAmount,
        total: grandTotal,
      },
    };

    booking.trackingTimeline.push({
      status: 'invoice_generated',
      timestamp: new Date(),
      note: `Invoice ${invoiceNumber} generated`,
    });

    await booking.save();
    return booking;
  }

  /**
   * Get invoice by booking ID
   */
  async getByBookingId(bookingId) {
    const booking = await ServiceBooking.findById(bookingId)
      .populate('customerId', 'firstName lastName phone email address')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('franchiseId', 'franchiseName ownerName address gstNumber')
      .populate('invoice.paymentId', 'amount status method');
    
    if (!booking) throw new AppError('Booking not found', 404, 'INV_BOOKING_NOT_FOUND');
    if (!booking.invoice?.generated) throw new AppError('Invoice not yet generated', 404, 'INV_NOT_FOUND');

    return {
      invoiceNumber: booking.invoice.invoiceNumber,
      generatedAt: booking.invoice.generatedAt,
      customer: booking.customerId,
      vehicle: booking.vehicleId,
      franchise: booking.franchiseId,
      serviceName: booking.serviceName,
      slotDate: booking.slotDate,
      breakdown: booking.invoice.breakdown,
      payment: booking.invoice.paymentId,
      status: booking.invoice.paymentStatus,
    };
  }

  /**
   * List invoices
   */
  async list({ page = 1, limit = 20, customerId, franchiseId, fromDate, toDate } = {}) {
    const match = { 'invoice.generated': true };
    if (customerId) match.customerId = customerId;
    if (franchiseId) match.franchiseId = franchiseId;
    if (fromDate || toDate) {
      match['invoice.generatedAt'] = {};
      if (fromDate) match['invoice.generatedAt'].$gte = new Date(fromDate);
      if (toDate) match['invoice.generatedAt'].$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      ServiceBooking.find(match)
        .select('bookingId serviceName slotDate totalAmount invoice customerId vehicleId franchiseId')
        .populate('customerId', 'firstName lastName phone')
        .populate('vehicleId', 'vehicleNumber')
        .populate('franchiseId', 'franchiseName')
        .sort({ 'invoice.generatedAt': -1 }).skip(skip).limit(limit),
      ServiceBooking.countDocuments(match),
    ]);

    return {
      data: bookings.map(b => ({
        _id: b._id,
        bookingId: b.bookingId,
        customer: b.customerId,
        vehicle: b.vehicleId,
        franchise: b.franchiseId,
        serviceName: b.serviceName,
        slotDate: b.slotDate,
        invoice: b.invoice,
      })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = new InvoiceService();
