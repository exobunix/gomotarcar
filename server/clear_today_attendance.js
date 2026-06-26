const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Cleaner = require('./src/models/Cleaner');
const Attendance = require('./src/models/Attendance');

async function clearToday() {
  await connectDB();
  console.log('Connected to DB');

  const user = await User.findOne({ phone: '+919810000000' });
  const cleaner = await Cleaner.findOne({ userId: user._id });
  
  if (!cleaner) {
    console.log('Cleaner Ramesh not found');
    process.exit(1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Attendance.deleteMany({
    cleanerId: cleaner._id,
    date: { $gte: today, $lt: tomorrow }
  });
  console.log("Successfully cleared today's attendance record for Ramesh Kumar!");
  process.exit(0);
}

clearToday().catch(console.error);
