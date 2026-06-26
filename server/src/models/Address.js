const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  label: { type: String, enum: ['Home','Office','Other'] },
  apartment: String, building: String, street: String, area: String,
  city: String, state: String, pincode: String,
  coordinates: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });
addressSchema.index({ customerId: 1 });
module.exports = mongoose.model('Address', addressSchema);
