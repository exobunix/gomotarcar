const mongoose = require('mongoose');

// We use the local MONGODB_URI to seed the local database.
const MONGODB_URI = 'mongodb://localhost:27017/gomotarcar';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected Locally: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Models
const User = require('./src/models/User');
const Cleaner = require('./src/models/Cleaner');
const Customer = require('./src/models/Customer');
const Vehicle = require('./src/models/Vehicle');
const Task = require('./src/models/Task');
const Attendance = require('./src/models/Attendance');
const Earnings = require('./src/models/Earnings');
const Zone = require('./src/models/Zone');
const Apartment = require('./src/models/Apartment');
const SubscriptionPackage = require('./src/models/SubscriptionPackage');
const Subscription = require('./src/models/Subscription');
const Supervisor = require('./src/models/Supervisor');
const Complaint = require('./src/models/Complaint');
const Issue = require('./src/models/Issue');

const INDIAN_NAMES = {
  cleaners: [
    { first: 'Ramesh', last: 'Kumar', phone: '+919810000000', email: 'ramesh@gomotarcar.com' },
    { first: 'Suresh', last: 'Yadav', phone: '+919810000001', email: 'suresh@gomotarcar.com' },
    { first: 'Amit', last: 'Sharma', phone: '+919810000002', email: 'amit@gomotarcar.com' },
    { first: 'Rahul', last: 'Singh', phone: '+919810000003', email: 'rahul@gomotarcar.com' },
    { first: 'Vijay', last: 'Patel', phone: '+919810000004', email: 'vijay@gomotarcar.com' }
  ],
  customers: [
    { first: 'Adarsh', last: 'Sachan', phone: '+919910000000', email: 'adarsh@gmail.com' },
    { first: 'Rajesh', last: 'Gupta', phone: '+919910000001', email: 'rajesh@gmail.com' },
    { first: 'Priya', last: 'Sharma', phone: '+919910000002', email: 'priya@gmail.com' },
    { first: 'Sunita', last: 'Verma', phone: '+919910000003', email: 'sunita@gmail.com' },
    { first: 'Anil', last: 'Mehta', phone: '+919910000004', email: 'anil@gmail.com' }
  ],
  supervisors: [
    { first: 'Vikram', last: 'Singh', phone: '+919710000000', email: 'vikram@gomotarcar.com' }
  ]
};

const CARS = [
  { make: 'Maruti Suzuki', model: 'Swift', color: 'White', fuelType: 'petrol', vehicleType: 'hatchback' },
  { make: 'Hyundai', model: 'Creta', color: 'Black', fuelType: 'diesel', vehicleType: 'suv' },
  { make: 'Honda', model: 'City', color: 'Silver', fuelType: 'petrol', vehicleType: 'sedan' },
  { make: 'Tata', model: 'Nexon', color: 'Blue', fuelType: 'cng', vehicleType: 'suv' },
  { make: 'Toyota', model: 'Fortuner', color: 'White', fuelType: 'diesel', vehicleType: 'luxury' }
];

async function seedCompleteDemo() {
  await connectDB();
  console.log('🔥 Starting complete demo database seed...');

  // 1. Clear existing collections to ensure a clean slate
  console.log('🧹 Clearing existing collections...');
  await User.deleteMany({});
  await Cleaner.deleteMany({});
  await Customer.deleteMany({});
  await Vehicle.deleteMany({});
  await Task.deleteMany({});
  await Attendance.deleteMany({});
  await Earnings.deleteMany({});
  await Zone.deleteMany({});
  await Apartment.deleteMany({});
  await SubscriptionPackage.deleteMany({});
  await Subscription.deleteMany({});
  await Supervisor.deleteMany({});
  await Complaint.deleteMany({});
  await Issue.deleteMany({});

  // 2. Create Zones
  console.log('📌 Creating zones...');
  const zoneA = await Zone.create({
    name: 'Andheri West Zone',
    city: 'Mumbai',
    state: 'Maharashtra',
    cleanerCount: 5,
    activeCleaners: 5,
    activeTasks: 15,
    radius: 100,
    isActive: true
  });

  // 3. Create Subscription Packages
  console.log('📌 Creating subscription packages...');
  const pkgBasic = await SubscriptionPackage.create({
    name: 'Basic Exterior Wash',
    code: 'BASIC-EXT',
    price: 999,
    discountPrice: 799,
    cleaningsPerMonth: 12,
    durationMonths: 1,
    services: [{ name: 'Exterior Wash', included: true }],
    features: ['Body Wash', 'Tire Dressing', 'Wiping'],
    isPopular: false,
    sortOrder: 1
  });

  const pkgPremium = await SubscriptionPackage.create({
    name: 'Premium Daily Wash',
    code: 'PREM-DAILY',
    price: 1999,
    discountPrice: 1599,
    cleaningsPerMonth: 24,
    durationMonths: 1,
    services: [{ name: 'Exterior Wash', included: true }, { name: 'Interior Vacuum', included: true }],
    features: ['Daily Exterior Wash', 'Bi-weekly Interior Vacuuming', 'Tire Polish'],
    isPopular: true,
    sortOrder: 2
  });

  // 4. Create Users (Admin, Supervisor, Cleaners, Customers)
  console.log('📌 Creating User credentials and profiles...');

  // Create Super Admin
  const adminUser = await User.create({
    phone: '+919000000000',
    email: 'admin@gomotarcar.com',
    passwordHash: 'admin123',
    role: 'super_admin',
    isActive: true,
    isVerified: true,
    phoneVerified: true
  });

  // Create Supervisor
  const supervisorUser = await User.create({
    phone: INDIAN_NAMES.supervisors[0].phone,
    email: INDIAN_NAMES.supervisors[0].email,
    passwordHash: 'password123',
    role: 'supervisor',
    isActive: true,
    isVerified: true,
    phoneVerified: true
  });

  const supervisorProfile = await Supervisor.create({
    userId: supervisorUser._id,
    firstName: INDIAN_NAMES.supervisors[0].first,
    lastName: INDIAN_NAMES.supervisors[0].last,
    phone: INDIAN_NAMES.supervisors[0].phone,
    email: INDIAN_NAMES.supervisors[0].email,
    assignedZone: zoneA._id,
    cleanerCount: 5,
    isActive: true
  });

  // Create Cleaners
  const cleaners = [];
  for (let i = 0; i < INDIAN_NAMES.cleaners.length; i++) {
    const cData = INDIAN_NAMES.cleaners[i];
    const u = await User.create({
      phone: cData.phone,
      email: cData.email,
      passwordHash: 'password123',
      role: 'cleaner',
      isActive: true,
      isVerified: true,
      phoneVerified: true
    });

    const cleaner = await Cleaner.create({
      userId: u._id,
      firstName: cData.first,
      lastName: cData.last,
      phone: cData.phone,
      email: cData.email,
      cleanerId: `GMC-CLN-${String(i + 1).padStart(3, '0')}`,
      assignedZone: zoneA._id,
      supervisorId: supervisorUser._id,
      joiningDate: new Date('2026-01-01'),
      experience: 2,
      employmentType: 'full-time',
      verificationStatus: 'verified',
      isActive: true,
      stats: {
        totalTasksCompleted: 150 + i * 10,
        totalEarnings: 25000 + i * 2000,
        averageRating: 4.8 - i * 0.1,
        attendancePercentage: 95,
        currentMonthTasks: 40,
        currentMonthEarnings: 8000
      }
    });

    cleaners.push(cleaner);
  }

  // Link cleaners to supervisor
  await Supervisor.updateOne(
    { _id: supervisorProfile._id },
    { $set: { allocatedCleaners: cleaners.map(c => c._id) } }
  );

  // Create Customers
  const customers = [];
  for (let i = 0; i < INDIAN_NAMES.customers.length; i++) {
    const custData = INDIAN_NAMES.customers[i];
    const u = await User.create({
      phone: custData.phone,
      email: custData.email,
      passwordHash: 'password123',
      role: 'customer',
      isActive: true,
      isVerified: true,
      phoneVerified: true
    });

    const customer = await Customer.create({
      userId: u._id,
      firstName: custData.first,
      lastName: custData.last,
      phone: custData.phone,
      email: custData.email,
      subscriptionStatus: 'active',
      totalBookings: 12,
      totalSpent: 4500,
      totalCleanings: 10,
      cleaningBalance: 14
    });

    customers.push(customer);
  }

  // 5. Create Apartments / Addresses
  console.log('📌 Creating Apartments & Societies...');
  const apartments = [];
  const societies = ['Gokuldham Heights', 'Oberoi Splendor', 'Lodha Fiorenza', 'Hiranandani Gardens', 'DLF Phase 3'];
  for (let i = 0; i < customers.length; i++) {
    const apt = await Apartment.create({
      customerId: customers[i]._id,
      name: `${societies[i % societies.length]} - Apt ${201 + i * 10}`,
      tower: `Tower ${String.fromCharCode(65 + i)}`,
      flatNumber: `${201 + i * 10}`,
      society: societies[i % societies.length],
      street: 'Link Road',
      area: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      coordinates: { type: 'Point', coordinates: [72.8277 + i * 0.001, 19.1160 + i * 0.001] },
      label: 'Apartment',
      isDefault: true,
      isActive: true
    });
    apartments.push(apt);
  }

  // Link apartments to supervisor
  await Supervisor.updateOne(
    { _id: supervisorProfile._id },
    { $set: { allocatedApartments: apartments.map(a => a._id) } }
  );

  // 6. Create Vehicles
  console.log('📌 Creating Vehicles & QR codes...');
  const vehicles = [];
  for (let i = 0; i < customers.length; i++) {
    const carDef = CARS[i % CARS.length];
    const veh = await Vehicle.create({
      customerId: customers[i]._id,
      vehicleNumber: `MH-02-AB-${1000 + i}`,
      make: carDef.make,
      model: carDef.model,
      year: 2022,
      color: carDef.color,
      fuelType: carDef.fuelType,
      vehicleType: carDef.vehicleType,
      rcVerified: true,
      qrCode: {
        code: `QR-VEH-${1000 + i}`,
        qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + `QR-VEH-${1000 + i}`,
        status: 'active',
        issuedAt: new Date()
      },
      isActive: true
    });
    vehicles.push(veh);
  }

  // 7. Create Subscriptions
  console.log('📌 Creating Subscriptions...');
  const subscriptions = [];
  for (let i = 0; i < customers.length; i++) {
    const pkg = i % 2 === 0 ? pkgPremium : pkgBasic;
    const cleaner = cleaners[i % cleaners.length];
    const sub = await Subscription.create({
      subscriptionId: `SUB-${1000 + i}`,
      customerId: customers[i]._id,
      vehicleId: vehicles[i]._id,
      apartmentId: apartments[i]._id,
      packageId: pkg._id,
      packageType: i % 2 === 0 ? 'premium' : 'basic',
      packageName: pkg.name,
      frequency: 'monthly',
      totalAmount: pkg.discountPrice,
      gstAmount: Math.round(pkg.discountPrice * 0.18),
      netAmount: Math.round(pkg.discountPrice * 1.18),
      paymentAmount: Math.round(pkg.discountPrice * 1.18),
      paymentMode: 'UPI',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-07-01'),
      durationMonths: 1,
      totalCleanings: pkg.cleaningsPerMonth,
      usedCleanings: 8,
      remainingCleanings: pkg.cleaningsPerMonth - 8,
      status: 'active',
      cleanerId: cleaner._id,
      supervisorId: supervisorUser._id
    });
    
    // Update customer and vehicle links
    await Customer.updateOne({ _id: customers[i]._id }, { $set: { activeSubscriptionId: sub._id, subscriptionStatus: 'active' } });
    await Vehicle.updateOne({ _id: vehicles[i]._id }, { $set: { subscriptionId: sub._id, packageType: sub.packageType } });
    
    subscriptions.push(sub);
  }

  // 8. Create Tasks (Historical + Today's Schedule)
  console.log('📌 Creating Tasks (Today and Historical)...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate Tasks for the past 10 days (completed) and today (assigned/completed/in_progress)
  for (let cIdx = 0; cIdx < cleaners.length; cIdx++) {
    const cleaner = cleaners[cIdx];
    
    // Historical completed tasks (e.g. 3 tasks per day for the last 5 days)
    for (let dayOffset = 5; dayOffset >= 1; dayOffset--) {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() - dayOffset);
      taskDate.setHours(0,0,0,0);

      for (let tNum = 0; tNum < 3; tNum++) {
        const custIdx = (cIdx + tNum) % customers.length;
        const customer = customers[custIdx];
        const vehicle = vehicles[custIdx];
        const sub = subscriptions[custIdx];

        await Task.create({
          taskId: `TSK-HIST-${cIdx}-${dayOffset}-${tNum}`,
          customerId: customer._id,
          vehicleId: vehicle._id,
          cleanerId: cleaner._id,
          subscriptionId: sub._id,
          scheduledDate: taskDate,
          scheduledTime: `0${8 + tNum}:30 AM`,
          timeSlot: 'morning',
          packageType: sub.packageType,
          status: 'completed',
          actualStartTime: new Date(taskDate.getTime() + (8 + tNum)*3600000 + 30*60000),
          actualEndTime: new Date(taskDate.getTime() + (9 + tNum)*3600000 + 15*60000),
          cleanerEarnings: 50,
          customerPaymentStatus: 'paid',
          qrVerified: true,
          statusHistory: [
            { status: 'assigned', changedAt: taskDate, remark: 'Task scheduled' },
            { status: 'in_progress', changedAt: taskDate, remark: 'Clean started' },
            { status: 'completed', changedAt: taskDate, remark: 'Car cleaned and photo uploaded' }
          ]
        });
      }
    }

    // Today's tasks (Ramesh has 8 tasks, others have 4 tasks)
    const tasksCountToday = cleaner.phone === '+919810000000' ? 8 : 4;
    for (let tNum = 0; tNum < tasksCountToday; tNum++) {
      const custIdx = (cIdx + tNum) % customers.length;
      const customer = customers[custIdx];
      const vehicle = vehicles[custIdx];
      const sub = subscriptions[custIdx];

      // Make some completed, some in_progress, some assigned
      let taskStatus = 'assigned';
      if (tNum < Math.floor(tasksCountToday / 2)) {
        taskStatus = 'completed';
      } else if (tNum === Math.floor(tasksCountToday / 2)) {
        taskStatus = 'in_progress';
      }

      await Task.create({
        taskId: `TSK-TODAY-${cIdx}-${tNum}`,
        customerId: customer._id,
        vehicleId: vehicle._id,
        cleanerId: cleaner._id,
        subscriptionId: sub._id,
        scheduledDate: new Date(),
        scheduledTime: `${tNum + 8 >= 12 ? (tNum + 8 === 12 ? 12 : tNum + 8 - 12) : tNum + 8}:00 ${tNum + 8 >= 12 ? 'PM' : 'AM'}`,
        timeSlot: tNum + 8 >= 12 ? 'afternoon' : 'morning',
        packageType: sub.packageType,
        status: taskStatus,
        actualStartTime: taskStatus !== 'assigned' ? new Date() : undefined,
        actualEndTime: taskStatus === 'completed' ? new Date() : undefined,
        cleanerEarnings: 50,
        customerPaymentStatus: 'paid',
        qrVerified: taskStatus === 'completed',
        statusHistory: [
          { status: 'assigned', changedAt: new Date(), remark: 'Scheduled' }
        ]
      });
    }
  }

  // 9. Create Attendance for the month of June 2026
  console.log('📌 Creating attendance history...');
  for (let cIdx = 0; cIdx < cleaners.length; cIdx++) {
    const cleaner = cleaners[cIdx];
    
    // Attendance from June 1st to June 25th
    for (let d = 1; d <= 25; d++) {
      const attDate = new Date(2026, 5, d); // Month is 0-indexed, so 5 is June
      const isSunday = attDate.getDay() === 0;
      
      let status = 'present';
      if (isSunday) {
        status = 'holiday';
      } else if (d === 10) {
        status = 'leave';
      } else if (d === 17) {
        status = 'absent';
      } else if (d === 5 || d === 15) {
        status = 'late';
      }

      const checkInTime = new Date(attDate);
      checkInTime.setHours(8, status === 'late' ? randomNum(15, 45) : randomNum(0, 10), 0);
      const checkOutTime = new Date(attDate);
      checkOutTime.setHours(17, randomNum(0, 15), 0);

      await Attendance.create({
        cleanerId: cleaner._id,
        date: attDate,
        status,
        checkIn: status === 'present' || status === 'late' ? {
          time: checkInTime,
          isLate: status === 'late',
          lateMinutes: status === 'late' ? 25 : 0
        } : undefined,
        checkOut: status === 'present' || status === 'late' ? {
          time: checkOutTime
        } : undefined,
        summary: status === 'present' || status === 'late' ? {
          totalWorkingMinutes: 540,
          effectiveWorkingMinutes: 510
        } : undefined
      });
    }

    // Today's attendance (Ramesh checked in, others check in)
    const todayAttDate = new Date();
    todayAttDate.setHours(0,0,0,0);
    
    const checkInTime = new Date();
    checkInTime.setHours(8, 5, 0);

    await Attendance.create({
      cleanerId: cleaner._id,
      date: new Date(),
      status: 'present',
      checkIn: {
        time: checkInTime,
        isLate: false
      }
    });
  }

  // 10. Create Earnings
  console.log('📌 Creating Earnings summary records...');
  for (let cIdx = 0; cIdx < cleaners.length; cIdx++) {
    const cleaner = cleaners[cIdx];
    
    // Monthly Earnings for May 2026
    await Earnings.create({
      cleanerId: cleaner._id,
      baseAmount: 7500,
      incentiveAmount: 850,
      netAmount: 8350,
      periodType: 'monthly',
      periodStart: new Date('2026-05-01'),
      periodEnd: new Date('2026-05-31'),
      paymentStatus: 'paid',
      breakdown: { perTaskRate: 50, taskCount: 150, incentiveRate: 0, overtimeRate: 0 }
    });

    // Monthly Earnings for June 2026 (accumulated)
    await Earnings.create({
      cleanerId: cleaner._id,
      baseAmount: 6000,
      incentiveAmount: 650,
      netAmount: 6650,
      periodType: 'monthly',
      periodStart: new Date('2026-06-01'),
      periodEnd: new Date('2026-06-30'),
      paymentStatus: 'processed',
      breakdown: { perTaskRate: 50, taskCount: 120, incentiveRate: 0, overtimeRate: 0 }
    });
  }

  // 11. Create Complaints and Issues (Customer and Cleaner feedback)
  console.log('📌 Creating Customer complaints and Cleaner issues...');
  await Complaint.create({
    ticketNumber: 'CMP-2026-001',
    customerId: customers[0]._id,
    category: 'service_quality',
    description: 'Windshield has water marks after today’s morning wash.',
    priority: 'medium',
    status: 'open'
  });

  await Complaint.create({
    ticketNumber: 'CMP-2026-002',
    customerId: customers[1]._id,
    category: 'scheduling',
    description: 'Cleaner arrived 30 mins late to clean the car.',
    priority: 'low',
    status: 'resolved'
  });

  await Issue.create({
    ticketNumber: 'ISS-2026-001',
    reportedBy: cleaners[0]._id,
    category: 'vehicle_locked',
    description: 'Vehicle MH-02-AB-1000 was locked and client did not pick up call.',
    priority: 'medium',
    status: 'open',
    timeline: [{ status: 'open', note: 'Issue raised by Ramesh' }]
  });

  console.log('🚀 Seed process complete!');
  console.log('Credentials Summary:');
  console.log('👉 Super Admin: phone: +919000000000 | pass: admin123 | email: admin@gomotarcar.com');
  console.log('👉 Supervisor:  phone: +919710000000 | pass: password123 | email: vikram@gomotarcar.com');
  console.log('👉 Cleaner 1:   phone: +919810000000 | pass: password123 | Name: Ramesh Kumar (Today Active, 8 Tasks)');
  console.log('👉 Cleaner 2:   phone: +919810000001 | pass: password123 | Name: Suresh Yadav');
  console.log('👉 Customer 1:  phone: +919910000000 | pass: password123 | Name: Adarsh Sachan');
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (require.main === module) {
  seedCompleteDemo().then(() => process.exit(0)).catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { seedCompleteDemo };
