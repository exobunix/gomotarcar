/**
 * MongoDB Index Optimization Script
 *
 * Analyzes all models for missing compound indexes and creates them.
 * Run: NODE_ENV=production node scripts/index-optimization.js
 *
 * This script identifies:
 * - Missing compound indexes for common query patterns
 * - Indexes on fields used in $lookup (foreignField)
 * - TTL indexes for time-series data
 * - Text indexes for searchable fields
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gomotarcar';

// Collection → recommended indexes
const RECOMMENDED_INDEXES = {
  users: [
    { keys: { role: 1, isActive: 1 }, options: { name: 'role_active' } },
    { keys: { phone: 1, isActive: 1 }, options: { name: 'phone_active' } },
  ],
  customers: [
    { keys: { userId: 1 }, options: { unique: true, name: 'user_id' } },
    { keys: { phone: 1 }, options: { name: 'phone' } },
    { keys: { referralCode: 1 }, options: { sparse: true, name: 'referral_code' } },
  ],
  cleaners: [
    { keys: { userId: 1 }, options: { unique: true, name: 'user_id' } },
    { keys: { supervisorId: 1, isActive: 1 }, options: { name: 'supervisor_active' } },
    { keys: { assignedZone: 1, isActive: 1 }, options: { name: 'zone_active' } },
    { keys: { 'address.coordinates': '2dsphere' }, options: { name: 'location_geo' } },
    { keys: { verificationStatus: 1 }, options: { name: 'verification' } },
  ],
  franchises: [
    { keys: { userId: 1 }, options: { unique: true, name: 'user_id' } },
    { keys: { 'address.coordinates': '2dsphere' }, options: { name: 'location_geo' } },
  ],
  servicebookings: [
    { keys: { bookingId: 1 }, options: { unique: true, name: 'booking_id' } },
    { keys: { customerId: 1, createdAt: -1 }, options: { name: 'customer_date' } },
    { keys: { franchiseId: 1, status: 1 }, options: { name: 'franchise_status' } },
    { keys: { status: 1, slotDate: 1 }, options: { name: 'status_slotdate' } },
    { keys: { slotDate: 1, isActive: 1 }, options: { name: 'slot_active' } },
  ],
  tasks: [
    { keys: { taskId: 1 }, options: { unique: true, name: 'task_id' } },
    { keys: { cleanerId: 1, scheduledDate: -1, status: 1 }, options: { name: 'cleaner_date_status' } },
    { keys: { customerId: 1, createdAt: -1 }, options: { name: 'customer_date' } },
    { keys: { location: '2dsphere' }, options: { name: 'location_geo' } },
    { keys: { supervisorId: 1, status: 1 }, options: { name: 'supervisor_status' } },
  ],
  attendances: [
    { keys: { cleanerId: 1, date: -1 }, options: { unique: true, name: 'cleaner_date' } },
    { keys: { date: -1, status: 1 }, options: { name: 'date_status' } },
  ],
  payments: [
    { keys: { razorpayOrderId: 1 }, options: { name: 'razorpay_order' } },
    { keys: { razorpayPaymentId: 1 }, options: { sparse: true, name: 'razorpay_payment' } },
    { keys: { payerId: 1, createdAt: -1 }, options: { name: 'payer_date' } },
    { keys: { status: 1, purpose: 1 }, options: { name: 'status_purpose' } },
    { keys: { referenceId: 1, referenceType: 1 }, options: { name: 'reference' } },
  ],
  qrcodes: [
    { keys: { code: 1 }, options: { unique: true, name: 'code' } },
    { keys: { vehicleId: 1, status: 1 }, options: { name: 'vehicle_status' } },
    { keys: { status: 1, createdAt: -1 }, options: { name: 'status_date' } },
  ],
  subscriptions: [
    { keys: { customerId: 1, status: 1 }, options: { name: 'customer_status' } },
    { keys: { status: 1, endDate: 1 }, options: { name: 'status_enddate' } },
    { keys: { cleanerId: 1 }, options: { name: 'cleaner' } },
  ],
  earnings: [
    { keys: { cleanerId: 1, periodStart: -1, periodType: 1 }, options: { name: 'cleaner_period' } },
    { keys: { paymentStatus: 1, payoutId: 1 }, options: { name: 'payment_payout' } },
  ],
  notifications: [
    { keys: { recipientId: 1, createdAt: -1, isRead: 1 }, options: { name: 'recipient_read_date' } },
  ],
  complaints: [
    { keys: { ticketNumber: 1 }, options: { unique: true, name: 'ticket' } },
    { keys: { customerId: 1, createdAt: -1 }, options: { name: 'customer_date' } },
    { keys: { status: 1, priority: 1 }, options: { name: 'status_priority' } },
    { keys: { assignedTo: 1, status: 1 }, options: { name: 'assignee_status' } },
  ],
  vehicles: [
    { keys: { vehicleNumber: 1 }, options: { unique: true, name: 'vehicle_number' } },
    { keys: { customerId: 1, isActive: 1 }, options: { name: 'customer_active' } },
    { keys: { 'qrCode.code': 1 }, options: { sparse: true, name: 'qrcode' } },
  ],
  zones: [
    { keys: { boundary: '2dsphere' }, options: { name: 'boundary_geo' } },
  ],
  apartments: [
    { keys: { customerId: 1, isDefault: 1 }, options: { name: 'customer_default' } },
    { keys: { city: 1, isActive: 1 }, options: { name: 'city_active' } },
  ],
  leaves: [
    { keys: { cleanerId: 1, fromDate: -1 }, options: { name: 'cleaner_dates' } },
    { keys: { status: 1, cleanerId: 1 }, options: { name: 'status_cleaner' } },
  ],
  incentives: [
    { keys: { cleanerId: 1, month: -1, year: -1 }, options: { name: 'cleaner_period' } },
    { keys: { status: 1 }, options: { name: 'status' } },
  ],
};

async function optimizeIndexes() {
  console.log('🔍 MongoDB Index Optimization');
  console.log('='.repeat(60));
  console.log(`Connecting to: ${MONGODB_URI.replace(/\/\/.+@/, '//***:***@')}\n`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const [collectionName, indexes] of Object.entries(RECOMMENDED_INDEXES)) {
    console.log(`\n📁 Collection: ${collectionName}`);

    const collection = db.collection(collectionName);

    // Get existing indexes
    const existingIndexes = await collection.indexes();
    const existingNames = new Set(existingIndexes.map(i => i.name));

    for (const idx of indexes) {
      if (existingNames.has(idx.options.name)) {
        console.log(`  ✅ ${idx.options.name} — already exists`);
        totalSkipped++;
        continue;
      }

      try {
        await collection.createIndex(idx.keys, idx.options);
        console.log(`  ✅ ${idx.options.name} — CREATED`);
        totalCreated++;
      } catch (err) {
        console.error(`  ❌ ${idx.options.name} — Error: ${err.message}`);
        totalErrors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   Created: ${totalCreated}`);
  console.log(`   Skipped: ${totalSkipped}`);
  console.log(`   Errors:  ${totalErrors}`);
  console.log('='.repeat(60));

  await mongoose.disconnect();
  process.exit(totalErrors > 0 ? 1 : 0);
}

optimizeIndexes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
