const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true },
  name: { type: String, required: true, trim: true },
  ownerName: { type: String, trim: true },
  phone: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  description: { type: String },
  logo: { type: String },
  photos: [{ type: String }],
  address: {
    street: String, city: String, state: String, pincode: String,
    coordinates: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
  },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' }],
  services: [{
    serviceId: String, name: String, price: Number, duration: Number, description: String,
  }],
  operatingHours: {
    monday: { open: String, close: String }, tuesday: { open: String, close: String },
    wednesday: { open: String, close: String }, thursday: { open: String, close: String },
    friday: { open: String, close: String }, saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  verified: { type: Boolean, default: false },
  documents: [{ type: { type: String }, url: String, status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' } }],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

providerSchema.index({ 'address.coordinates': '2dsphere' });
providerSchema.index({ categories: 1 });
providerSchema.index({ verified: 1 });
providerSchema.index({ name: 'text', 'services.name': 'text' });

module.exports = mongoose.model('ServiceProvider', providerSchema);
