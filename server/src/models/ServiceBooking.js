const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  serviceName: String,
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },
  franchiseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchise' },
  slotDate: Date, slotTime: String,
  serviceMode: { type: String, enum: ['workshop','pickup_drop','doorstep'] },
  basePrice: Number,
  extraCharges: [{ item: String, amount: Number, approved: { type: Boolean, default: false } }],
  discount: { type: Number, default: 0 }, totalAmount: Number,
  status: { type: String, enum: ['booked','accepted','in_progress','completed','cancelled','job_card_pending','job_card_approved'], default: 'booked' },
  trackingTimeline: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  jobCard: {
    generated: { type: Boolean, default: false }, invoiceUrl: String,
    additionalWork: [{ description: String, amount: Number, customerApproved: { type: Boolean, default: false } }],
  },
  reviewed: { type: Boolean, default: false }, customerRating: Number, reviewText: String,
}, { timestamps: true });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ status: 1 });
module.exports = mongoose.model('ServiceBooking', bookingSchema);
