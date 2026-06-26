const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Cleaner = require('./src/models/Cleaner');
const Customer = require('./src/models/Customer');
const Vehicle = require('./src/models/Vehicle');
const Task = require('./src/models/Task');
const Attendance = require('./src/models/Attendance');
const Earnings = require('./src/models/Earnings');

async function seedToday() {
  await connectDB();
  console.log('Connected to DB');

  // Find Ramesh Kumar (cleaner0)
  const user = await User.findOne({ phone: '+919810000000' });
  const cleaner = await Cleaner.findOne({ userId: user._id });
  
  if (!cleaner) {
    console.log('Cleaner not found');
    process.exit(1);
  }

  // Get a few random customers and vehicles
  const customers = await Customer.find().limit(5);
  const vehicles = await Vehicle.find().limit(5);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  // Clean old tasks for today to avoid duplicates
  await Task.deleteMany({
    cleanerId: cleaner._id,
    scheduledDate: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });

  // 1. Create Tasks for Today (08 total: 05 completed, 03 pending)
  const tasksToCreate = [];
  
  // 5 Completed Jobs
  for (let i = 0; i < 5; i++) {
    const hour = 9 + i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour > 12 ? hour - 12 : hour;
    tasksToCreate.push({
      taskId: `TSK-TODAY-${i}`,
      customerId: customers[i]._id,
      vehicleId: vehicles[i]._id,
      cleanerId: cleaner._id,
      scheduledDate: new Date(),
      scheduledTime: `${formattedHour.toString().padStart(2, '0')}:00 ${ampm}`,
      timeSlot: 'morning',
      packageType: 'premium',
      status: 'completed',
      statusHistory: [{ status: 'completed', changedAt: new Date(), remark: 'Done' }]
    });
  }

  // 3 Pending Jobs
  for (let i = 5; i < 8; i++) {
    const hour = 2 + (i - 5);
    tasksToCreate.push({
      taskId: `TSK-TODAY-${i}`,
      customerId: customers[i % 5]._id,
      vehicleId: vehicles[i % 5]._id,
      cleanerId: cleaner._id,
      scheduledDate: new Date(),
      scheduledTime: `${hour.toString().padStart(2, '0')}:00 PM`,
      timeSlot: 'afternoon',
      packageType: 'basic',
      status: 'assigned',
      statusHistory: [{ status: 'assigned', changedAt: new Date(), remark: 'Assigned' }]
    });
  }

  await Task.insertMany(tasksToCreate);
  console.log('Created 8 tasks for today');

  // 2. Create Earnings for Today
  const earningsDate = new Date();
  earningsDate.setHours(0, 0, 0, 0);
  
  await Earnings.deleteMany({
    cleanerId: cleaner._id,
    periodStart: { $gte: earningsDate }
  });

  await Earnings.create({
    cleanerId: cleaner._id,
    baseAmount: 1000,
    incentiveAmount: 250,
    netAmount: 1250,
    periodType: 'daily',
    periodStart: new Date(),
    periodEnd: new Date(),
    paymentStatus: 'pending',
    breakdown: { perTaskRate: 50, taskCount: 8, incentiveRate: 0, overtimeRate: 0 }
  });
  console.log('Created earnings for today (1250)');

  // 3. Create Attendance for Today (Check-In)
  await Attendance.deleteMany({
    cleanerId: cleaner._id,
    date: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });

  await Attendance.create({
    cleanerId: cleaner._id,
    date: new Date(),
    status: 'present',
    checkIn: { time: new Date(), isLate: false, lateMinutes: 0 },
    summary: { totalWorkingMinutes: 0, effectiveWorkingMinutes: 0, overtimeMinutes: 0 }
  });
  console.log('Created attendance for today');

  // Update cleaner stats
  await Cleaner.updateOne(
    { _id: cleaner._id },
    { $set: { attendanceRate: 96, 'stats.currentMonthEarnings': 1250 } }
  );

  console.log('Successfully seeded Ramesh Kumar for today!');
  process.exit(0);
}

seedToday().catch(console.error);
