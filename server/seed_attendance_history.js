const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Cleaner = require('./src/models/Cleaner');
const Attendance = require('./src/models/Attendance');

async function seedHistory() {
  await connectDB();
  console.log('Connected to DB');

  const user = await User.findOne({ phone: '+919810000000' });
  const cleaner = await Cleaner.findOne({ userId: user._id });
  
  if (!cleaner) {
    console.log('Cleaner Ramesh not found');
    process.exit(1);
  }

  // Delete previous history for Ramesh (excluding today, keeping today's record)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Attendance.deleteMany({
    cleanerId: cleaner._id,
    date: { $lt: today }
  });

  const recordsToCreate = [];
  const startDay = 1;
  const currentDay = new Date().getDate(); // e.g. 25

  for (let d = startDay; d < currentDay; d++) {
    const recordDate = new Date(today.getFullYear(), today.getMonth(), d);
    if (recordDate.getDay() === 0) {
      // Sunday is absent/holiday
      recordsToCreate.push({
        cleanerId: cleaner._id,
        date: recordDate,
        status: 'absent',
      });
      continue;
    }

    // Mostly present, but seed two late check-ins for realism
    const isLateDay = d === 12 || d === 18;
    const status = isLateDay ? 'late' : 'present';

    const checkInTime = new Date(recordDate);
    if (isLateDay) {
      checkInTime.setHours(9, 15, 0, 0);
    } else {
      checkInTime.setHours(8, 15, 0, 0);
    }

    const checkOutTime = new Date(recordDate);
    checkOutTime.setHours(17, 30 + (d % 3) * 10, 0, 0); // 5:30 - 5:50 PM

    const workingMinutes = Math.round((checkOutTime - checkInTime) / 60000);

    recordsToCreate.push({
      cleanerId: cleaner._id,
      date: recordDate,
      status: status,
      checkIn: {
        time: checkInTime,
        address: 'Green Valley Apartments, Sector 45, Noida',
        isLate: isLateDay,
        lateMinutes: isLateDay ? 45 : 0
      },
      checkOut: {
        time: checkOutTime,
        address: 'Green Valley Apartments, Sector 45, Noida',
        isEarly: false
      },
      summary: {
        totalWorkingMinutes: workingMinutes,
        effectiveWorkingMinutes: workingMinutes
      }
    });
  }

  await Attendance.insertMany(recordsToCreate);
  console.log(`Successfully seeded ${recordsToCreate.length} attendance records for cleaner Ramesh!`);
  
  // Recalculate attendance stats
  const totalAttendances = await Attendance.countDocuments({ cleanerId: cleaner._id });
  const presentDays = await Attendance.countDocuments({ cleanerId: cleaner._id, status: { $in: ['present', 'half-day', 'late'] } });
  const attendancePct = totalAttendances > 0 ? Math.round((presentDays / totalAttendances) * 100) : 0;
  
  await Cleaner.findByIdAndUpdate(cleaner._id, {
    'stats.attendancePercentage': attendancePct,
    attendanceRate: attendancePct
  });
  console.log(`Updated cleaner attendance rate to ${attendancePct}%`);

  process.exit(0);
}

seedHistory().catch(console.error);
