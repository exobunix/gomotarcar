const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  tower: {
    type: String,
    trim: true,
  },
  flatNumber: {
    type: String,
    trim: true,
  },
  society: {
    type: String,
    trim: true,
  },
  street: {
    type: String,
    trim: true,
  },
  area: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  label: {
    type: String,
    enum: ['Apartment', 'Villa', 'Society', 'Independent House', 'Other'],
    default: 'Apartment',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

apartmentSchema.index({ customerId: 1 });
apartmentSchema.index({ city: 1 });
apartmentSchema.index({ 'coordinates': '2dsphere' });

module.exports = mongoose.model('Apartment', apartmentSchema);
