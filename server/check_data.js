const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/gomotarcar').then(async () => {
  const ServiceBooking = require('./src/models/ServiceBooking');
  const Payment = require('./src/models/Payment');
  const Admin = require('./src/models/Admin');
  const Cleaner = require('./src/models/Cleaner');
  const Customer = require('./src/models/Customer');
  const Subscription = require('./src/models/Subscription');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalBookings,
    todayBookings,
    bookingStatuses,
    totalRevenue,
    todayRevenue,
    paymentPurposes,
    admins,
    adminRoles,
    subStatuses,
  ] = await Promise.all([
    ServiceBooking.countDocuments(),
    ServiceBooking.countDocuments({ createdAt: { $gte: today } }),
    ServiceBooking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { status: 'captured', createdAt: { $gte: today } } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $group: { _id: '$purpose', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Admin.find({}, 'role firstName lastName isActive email').limit(30),
    Admin.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Subscription.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  console.log('\n=== BOOKINGS ===');
  console.log('Total:', totalBookings, ' | Today:', todayBookings);
  console.log('By Status:', JSON.stringify(bookingStatuses));

  console.log('\n=== REVENUE ===');
  console.log('Total Revenue:', totalRevenue[0]?.t || 0);
  console.log('Today Revenue:', todayRevenue[0]?.t || 0);
  console.log('By Purpose:', JSON.stringify(paymentPurposes));

  console.log('\n=== ADMINS / OPS TEAM ===');
  console.log('All Admins:', JSON.stringify(admins.map(a => ({ role: a.role, name: a.firstName, active: a.isActive }))));
  console.log('Admin Roles:', JSON.stringify(adminRoles));

  console.log('\n=== SUBSCRIPTIONS ===');
  console.log('By Status:', JSON.stringify(subStatuses));

  mongoose.disconnect();
}).catch(e => { console.error(e.message); process.exit(1); });
