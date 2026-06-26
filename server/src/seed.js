/**
 * GoMotarCar Database Seed Script
 * 
 * Run with: node src/seed.js
 * Seeds all collections with sample data if they're empty.
 * 
 * Scale: 100 customers, 50 cleaners, 200 vehicles, 500 bookings,
 * 300 payments, 50 complaints, 100 notifications, 20 franchises,
 * 100 apartments, 20 zones
 */

const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Customer = require('./models/Customer');
const Cleaner = require('./models/Cleaner');
const Franchise = require('./models/Franchise');
const Zone = require('./models/Zone');
const Apartment = require('./models/Apartment');
const ServiceCategory = require('./models/ServiceCategory');
const ServiceProvider = require('./models/ServiceProvider');
const ServiceBooking = require('./models/ServiceBooking');
const Vehicle = require('./models/Vehicle');
const Task = require('./models/Task');
const Attendance = require('./models/Attendance');
const Earnings = require('./models/Earnings');
const Payment = require('./models/Payment');
const Complaint = require('./models/Complaint');
const Issue = require('./models/Issue');
const TrainingVideo = require('./models/TrainingVideo');
const Settings = require('./models/Settings');
const Notification = require('./models/Notification');
const SubscriptionPackage = require('./models/SubscriptionPackage');
const Subscription = require('./models/Subscription');

// ─── Helpers ───
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (startDaysAgo, endDaysAgo) => {
  const start = new Date();
  start.setDate(start.getDate() - startDaysAgo);
  const end = new Date();
  end.setDate(end.getDate() - endDaysAgo);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ─── Static Data ───
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Thane', 'Agra', 'Nashik', 'Faridabad'];
const ZONE_NAMES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H', 'Zone I', 'Zone J', 'Zone K', 'Zone L', 'Zone M', 'Zone N', 'Zone O', 'Zone P', 'Zone Q', 'Zone R', 'Zone S', 'Zone T'];
const FRANCHISE_NAMES = ['CleanPro Services', 'SparkleWash', 'AutoShine', 'QuickClean', 'MegaWash', 'EcoClean', 'PremiumWash', 'SpeedClean', 'AquaShine', 'GlossWash', 'UrbanShine', 'FreshWash', 'Elite Wash', 'StarClean', 'RoyalWash', 'GreenShine', 'ProWash', 'SmartClean', 'CityWash', 'SuperShine'];
const OWNER_NAMES = ['Rajesh Kumar', 'Amit Sharma', 'Suresh Patel', 'Vijay Singh', 'Ravi Verma', 'Arun Joshi', 'Nitin Gupta', 'Deepak Yadav', 'Sanjay Tiwari', 'Manish Chauhan', 'Prakash Mishra', 'Rakesh Pandey', 'Mukesh Dubey', 'Dinesh Saxena', 'Kumar Trivedi', 'Harish Bhatt', 'Rohit Thakur', 'Gaurav Mehta', 'Ankur Jain', 'Mohan Das'];
const CLEANER_FIRST_NAMES = ['Rahul', 'Amit', 'Vijay', 'Sunil', 'Ravi', 'Manish', 'Deepak', 'Sandeep', 'Ajay', 'Nitin', 'Alok', 'Pankaj', 'Rajesh', 'Sanjay', 'Arun', 'Vikas', 'Dinesh', 'Manoj', 'Anil', 'Sachin', 'Gaurav', 'Rohit', 'Karan', 'Akash', 'Vishal', 'Abhishek', 'Pradeep', 'Ankur', 'Mohit', 'Harsh', 'Siddharth', 'Yogesh', 'Ramesh', 'Suresh', 'Mahesh', 'Ranjeet', 'Satyam', 'Shivam', 'Tushar', 'Uday', 'Varun', 'Wasim', 'Yash', 'Aryan', 'Bhuvan', 'Chandan', 'Eshan', 'Faisal', 'Ganesh', 'Hemant'];
const CLEANER_LAST_NAMES = ['Kumar', 'Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Yadav', 'Joshi', 'Tiwari', 'Chauhan', 'Mishra', 'Pandey', 'Dubey', 'Saxena', 'Trivedi', 'Bhatt', 'Thakur', 'Mehta', 'Jain', 'Das', 'Nair', 'Menon', 'Reddy', 'Naidu', 'Pillai'];
const CUSTOMER_FIRST_NAMES = ['Priya', 'Ananya', 'Neha', 'Pooja', 'Sneha', 'Ritu', 'Kavita', 'Anita', 'Shweta', 'Divya', 'Amita', 'Nandini', 'Meera', 'Rashmi', 'Shalini', 'Preeti', 'Nisha', 'Sheetal', 'Pallavi', 'Swati', 'Rohini', 'Vandana', 'Geeta', 'Kirti', 'Maya', 'Rekha', 'Sonia', 'Tanya', 'Uma', 'Varsha', 'Ritu', 'Komal', 'Jyoti', 'Deepika', 'Ranjana', 'Sangeeta', 'Manisha', 'Kiran', 'Anjali', 'Lata', 'Radha', 'Seema', 'Shobha', 'Sarita', 'Renu', 'Mithila', 'Kaushalya', 'Devika', 'Hema', 'Isha', 'Aarti', 'Bhavna', 'Charvi', 'Damini', 'Esha', 'Farzana', 'Garima', 'Harshita', 'Indira', 'Jaya', 'Kritika', 'Lavanya', 'Madhu', 'Nalini', 'Ojaswini', 'Parul', 'Quasar', 'Rajni', 'Shikha', 'Tara', 'Urmila', 'Vaishali', 'Wanda', 'Xena', 'Yamini', 'Zara', 'Anika', 'Bindiya', 'Chitra', 'Deepti', 'Eila', 'Falguni', 'Geetanjali', 'Hasna', 'Ipsita', 'Jhanvi', 'Kashish', 'Lipika', 'Mitali', 'Nayana', 'Onika', 'Pratibha', 'Qimat', 'Rukmini', 'Suhani', 'Tanvi', 'Urvashi', 'Vidya', 'Wisha', 'Yukti', 'Zubin'];
const CUSTOMER_LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Yadav', 'Joshi', 'Mishra', 'Agarwal', 'Kapoor', 'Malhotra', 'Saxena', 'Trivedi', 'Pandey', 'Dubey', 'Bhatt', 'Thakur', 'Mehta', 'Jain', 'Das', 'Nair', 'Reddy', 'Naidu', 'Iyer', 'Krishnan', 'Menon'];
const CATEGORY_NAMES = ['Exterior Wash', 'Interior Cleaning', 'Full Detailing', 'Engine Cleaning', 'Polish & Wax', 'Dent Paint', 'AC Service', 'Underbody Wash'];
const PROVIDER_NAMES = ['ProWash Services', 'Elite Auto Spa', 'GreenClean', 'TurboWash', 'Luxury Shine', 'EcoWash', 'Express Clean', 'Star Wash', 'King Car Care', 'ShinePro'];
const VEHICLE_MODELS = ['Swift', 'i10', 'i20', 'Alto', 'WagonR', 'Baleno', 'Dzire', 'Creta', 'Venue', 'Seltos', 'City', 'Amaze', 'XUV300', 'Bolero', 'Scorpio', 'Nexon', 'Tigor', 'Tiago', 'Punch', 'Harrier', 'Safari', 'Fortuner', 'Innova', 'Glanza', 'Fronx', 'Grand Vitara', 'XUV700', 'Thar', 'Kushaq', 'Slavia'];
const VEHICLE_MAKES = ['Maruti', 'Hyundai', 'Honda', 'Kia', 'Mahindra', 'Tata', 'Toyota', 'Renault', 'Volkswagen', 'Ford', 'Skoda', 'MG', 'Nissan', 'Jeep', 'BMW'];
const SOCIETY_NAMES = ['Green Valley', 'Sunrise Tower', 'Lake Vista', 'Royal Palm', 'Silver Oak', 'Golden Nest', 'Crystal Heights', 'Blue Ridge', 'Maple Garden', 'Palm Grove', 'Ivy Terrace', 'Rosewood Estate', 'Cedar Court', 'Willow Creek', 'Magnolia Residency', 'Jasmine Manor', 'Orchid Enclave', 'Lily Heights', 'Lotus Garden', 'Daisy Park'];
const NOTIF_TYPES = ['task_assignment', 'booking_update', 'payment_update', 'complaint_update', 'attendance_alert', 'training', 'system'];
const NOTIF_TITLES = [
  'New task assigned to you',
  'Booking #BKG-{id} has been updated',
  'Payment of ₹{amount} received successfully',
  'New complaint raised - #{id}',
  'Attendance marked for today',
  'New training module available',
  'System maintenance scheduled',
];

async function seed() {
  await connectDB();
  console.log('🔥 Connected to MongoDB. Seeding data...\n');

  // ─── Zones ───
  const zoneCount = await Zone.countDocuments();
  let zones = [];
  if (zoneCount === 0) {
    console.log('📌 Creating zones...');
    zones = await Zone.insertMany(
      ZONE_NAMES.map((name, i) => ({
        name,
        city: CITIES[i % CITIES.length],
        state: 'Maharashtra',
        cleanerCount: randomNum(3, 8),
        activeCleaners: randomNum(2, 5),
        activeTasks: randomNum(5, 20),
        radius: randomNum(50, 200),
        isActive: true,
      }))
    );
    console.log(`  ✓ Created ${zones.length} zones`);
  } else {
    zones = await Zone.find();
    console.log(`  - ${zoneCount} zones already exist, skipping`);
  }

  // ─── Super Admin User ───
  let admin = await User.findOne({ phone: '+919000000000' });
  if (!admin) {
    console.log('📌 Creating admin user...');
    admin = await User.create({
      phone: '+919000000000',
      email: 'admin@gomotarcar.com',
      passwordHash: 'admin123',
      role: 'super_admin',
      isActive: true,
      isVerified: true,
      phoneVerified: true,
    });
    console.log('  ✓ Admin user created (phone: +919000000000, password: admin123)');
  }

  // ─── Additional Admin Roles ───
  const adminsToCreate = [
    { phone: '+919000000001', email: 'manager@gomotarcar.com', role: 'manager', isActive: true, isVerified: true, name: 'Manager' },
    { phone: '+919000000002', email: 'franchise@gomotarcar.com', role: 'franchise', isActive: true, isVerified: true, name: 'Franchise Admin' },
    { phone: '+919000000003', email: 'operations@gomotarcar.com', role: 'operations', isActive: true, isVerified: true, name: 'Operations' },
  ];
  for (const a of adminsToCreate) {
    const exists = await User.findOne({ phone: a.phone });
    if (!exists) {
      await User.create({ ...a, passwordHash: 'admin123', phoneVerified: true });
      console.log(`  ✓ ${a.name} created (${a.email} / admin123)`);
    }
  }

  // ─── Customers (100 total) ───
  const customerCount = await Customer.countDocuments();
  if (customerCount < 100) {
    console.log('📌 Creating customers...');
    const existing = await Customer.countDocuments();
    const toCreate = 100 - existing;
    const batch = [];

    for (let i = existing; i < 100; i++) {
      const phone = `+9199${String(10000000 + i).slice(0, 8)}`;
      const user = await User.create({
        phone,
        email: `customer${i}@gmail.com`,
        passwordHash: 'password123',
        role: 'customer',
        isVerified: true,
        phoneVerified: true,
      });
      batch.push({
        userId: user._id,
        firstName: CUSTOMER_FIRST_NAMES[i % CUSTOMER_FIRST_NAMES.length],
        lastName: CUSTOMER_LAST_NAMES[i % CUSTOMER_LAST_NAMES.length],
        phone,
        email: `customer${i}@gmail.com`,
        totalBookings: randomNum(1, 30),
        totalSpent: randomNum(500, 15000),
        totalCleanings: randomNum(1, 25),
        cleaningBalance: randomNum(0, 5),
        subscriptionStatus: randomItem(['none', 'none', 'none', 'active', 'expired']),
      });
    }

    await Customer.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} customers (total: ${100})`);
  } else {
    console.log(`  - ${customerCount} customers already exist, skipping`);
  }

  // ─── Cleaners (50 total) ───
  const cleanerCount = await Cleaner.countDocuments();
  if (cleanerCount < 50) {
    console.log('📌 Creating cleaners...');
    const existing = await Cleaner.countDocuments();
    const batch = [];

    for (let i = existing; i < 50; i++) {
      const phone = `+9198${String(10000000 + i).slice(0, 8)}`;
      const user = await User.create({
        phone,
        email: `cleaner${i}@gmail.com`,
        passwordHash: 'password123',
        role: 'cleaner',
        isVerified: true,
        phoneVerified: true,
      });

      const cleanerId = `GMC-${String(i + 1).padStart(4, '0')}`;
      batch.push({
        userId: user._id,
        firstName: CLEANER_FIRST_NAMES[i % CLEANER_FIRST_NAMES.length],
        lastName: CLEANER_LAST_NAMES[i % CLEANER_LAST_NAMES.length],
        phone,
        cleanerId,
        email: `cleaner${i}@gmail.com`,
        joiningDate: randomDate(365, 30),
        experience: randomNum(1, 10),
        employmentType: randomItem(['full-time', 'full-time', 'full-time', 'full-time', 'part-time']),
        assignedZone: zones[i % zones.length]._id,
        verificationStatus: randomItem(['verified', 'verified', 'verified', 'pending']),
        isActive: true,
        language: randomItem(['en', 'hi', 'mr', 'gu']),
        stats: {
          totalTasksCompleted: randomNum(50, 500),
          totalEarnings: randomNum(5000, 100000),
          averageRating: randomNum(35, 50) / 10,
          currentMonthTasks: randomNum(10, 50),
          currentMonthEarnings: randomNum(1000, 15000),
        },
      });
    }

    await Cleaner.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} cleaners (total: ${50})`);
  } else {
    console.log(`  - ${cleanerCount} cleaners already exist, skipping`);
  }

  // ─── Franchises (20 total) ───
  const franchiseCount = await Franchise.countDocuments();
  if (franchiseCount < 20) {
    console.log('📌 Creating franchises...');
    const existing = await Franchise.countDocuments();
    const batch = [];

    for (let i = existing; i < 20; i++) {
      const phone = `+9197${String(10000000 + i).slice(0, 8)}`;
      const user = await User.create({
        phone,
        email: `franchise${i}@gmail.com`,
        passwordHash: 'password123',
        role: 'franchise',
        isVerified: true,
        phoneVerified: true,
      });

      batch.push({
        userId: user._id,
        franchiseName: FRANCHISE_NAMES[i],
        ownerName: OWNER_NAMES[i],
        phone,
        email: `franchise${i}@gmail.com`,
        address: { street: 'Main Road', city: CITIES[i % CITIES.length], state: 'Maharashtra', pincode: '400001', coordinates: { type: 'Point', coordinates: [72.8777, 19.0760] } },
        type: randomItem(['workshop', 'service_center', 'cleaning_station']),
        serviceZones: [zones[i % zones.length]._id],
        isActive: true,
        verificationStatus: randomItem(['verified', 'verified', 'verified', 'pending']),
        agreement: { commissionPercent: randomNum(5, 20), startDate: randomDate(365, 0) },
        stats: { totalRevenue: randomNum(50000, 500000), totalCommission: randomNum(5000, 50000), totalBookings: randomNum(50, 500), rating: randomNum(35, 50) / 10 },
      });
    }

    await Franchise.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} franchises (total: ${20})`);
  } else {
    console.log(`  - ${franchiseCount} franchises already exist, skipping`);
  }

  // Get all records for references
  const allCustomers = await Customer.find();
  const allCleaners = await Cleaner.find();
  const allFranchises = await Franchise.find();
  const allUsers = await User.find();

  // ─── Vehicles (200 total) ───
  const vehicleCount = await Vehicle.countDocuments();
  if (vehicleCount < 200) {
    console.log('📌 Creating vehicles...');
    const existing = await Vehicle.countDocuments();
    const batch = [];
    for (let i = existing; i < 200; i++) {
      const customer = allCustomers[i % allCustomers.length];
      const prefix = String.fromCharCode(65 + (i % 5)) + String.fromCharCode(66 + (i % 4));
      const num = String(1000 + i).slice(-4);
      batch.push({
        customerId: customer._id,
        vehicleNumber: `MH-01-${prefix}${num}`,
        make: randomItem(VEHICLE_MAKES),
        model: randomItem(VEHICLE_MODELS),
        year: randomNum(2015, 2025),
        color: randomItem(['White', 'Black', 'Silver', 'Blue', 'Red', 'Grey', 'Green', 'Brown']),
        fuelType: randomItem(['petrol', 'diesel', 'electric', 'cng']),
        vehicleType: randomItem(['hatchback', 'sedan', 'suv', 'luxury']),
        isActive: true,
        totalCleanings: randomNum(0, 30),
        lastServiceDate: randomDate(180, 1),
      });
    }
    await Vehicle.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} vehicles (total: ${200})`);
  }

  // ─── Apartments (100 total) ───
  const aptCount = await Apartment.countDocuments();
  if (aptCount < 100) {
    console.log('📌 Creating apartments...');
    const existing = await Apartment.countDocuments();
    const batch = [];
    for (let i = existing; i < 100; i++) {
      const customer = allCustomers[i % allCustomers.length];
      const city = CITIES[i % CITIES.length];
      const society = SOCIETY_NAMES[i % SOCIETY_NAMES.length];
      batch.push({
        customerId: customer._id,
        name: `${society} - Flat ${100 + i}`,
        tower: `Tower ${String.fromCharCode(65 + (i % 5))}`,
        flatNumber: `${100 + i}`,
        society: society,
        street: `${i + 1}st Main Road`,
        area: `${city} West`,
        city: city,
        state: 'Maharashtra',
        pincode: String(400000 + (i % 999)).padStart(6, '0'),
        coordinates: { type: 'Point', coordinates: [72.8777, 19.0760] },
        label: randomItem(['Apartment', 'Villa', 'Society', 'Independent House']),
        isDefault: i < 20,
        isActive: true,
      });
    }
    await Apartment.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} apartments (total: ${100})`);
  }

  // ─── Bookings — ServiceBooking (500 total) ───
  const bookingCount = await ServiceBooking.countDocuments();
  if (bookingCount < 500) {
    console.log('📌 Creating bookings...');
    const allVehicles = await Vehicle.find();
    // Process in batches of 200 to avoid memory issues
    let created = await ServiceBooking.countDocuments();
    const statuses = ['booked', 'accepted', 'in_progress', 'completed', 'completed', 'completed', 'completed', 'cancelled'];
    const services = ['Car Wash', 'Premium Wash', 'Full Detail', 'Interior Clean', 'Engine Bay Clean', 'Polish & Wax', 'AC Sanitization', 'Underbody Wash'];

    while (created < 500) {
      const batch = [];
      const batchSize = Math.min(100, 500 - created);
      for (let j = 0; j < batchSize; j++) {
        const i = created + j;
        const customer = allCustomers[i % allCustomers.length];
        const vehicle = allVehicles[i % allVehicles.length];
        const franchise = allFranchises[i % allFranchises.length];
        const date = randomDate(90, 1);
        const status = randomItem(statuses);
        const amount = randomNum(200, 2000);
        batch.push({
          bookingId: `BKG-${String(4000 + i)}`,
          customerId: customer._id,
          vehicleId: vehicle._id,
          franchiseId: franchise._id,
          serviceName: randomItem(services),
          slotDate: date,
          slotTime: randomItem(['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '15:00', '16:00']),
          basePrice: amount,
          totalAmount: Math.round(amount * 1.18),
          status,
          paymentStatus: status === 'completed' ? 'paid' : randomItem(['pending', 'pending', 'paid']),
          trackingTimeline: [
            { status: 'booked', timestamp: date, note: 'Booking created' },
            ...(status !== 'booked' ? [{ status: 'accepted', timestamp: new Date(date.getTime() + 3600000), note: 'Booking accepted' }] : []),
            ...(status === 'completed' ? [{ status: 'completed', timestamp: new Date(date.getTime() + 7200000), note: 'Service completed' }] : []),
          ],
        });
      }
      await ServiceBooking.insertMany(batch);
      created += batchSize;
      console.log(`  ... ${created}/500 bookings`);
    }
    console.log(`  ✓ Created 500 bookings total`);
  } else {
    console.log(`  - ${bookingCount} bookings already exist, skipping`);
  }

  // ─── Tasks (500 total - expanded) ───
  const taskCount = await Task.countDocuments();
  if (taskCount < 500) {
    console.log('📌 Creating tasks...');
    const allVehicles = await Vehicle.find();
    let created = await Task.countDocuments();
    const taskStatuses = ['assigned', 'in_progress', 'completed', 'completed', 'completed', 'completed', 'missed'];

    while (created < 500) {
      const batch = [];
      const batchSize = Math.min(100, 500 - created);
      for (let j = 0; j < batchSize; j++) {
        const i = created + j;
        const customer = allCustomers[i % allCustomers.length];
        const vehicle = allVehicles[i % allVehicles.length];
        const cleaner = allCleaners[i % allCleaners.length];
        const date = randomDate(90, 1);
        const status = randomItem(taskStatuses);
        batch.push({
          taskId: `TSK-${String(5000 + i)}`,
          customerId: customer._id,
          vehicleId: vehicle._id,
          cleanerId: cleaner._id,
          scheduledDate: date,
          scheduledTime: randomItem(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']),
          timeSlot: randomItem(['morning', 'afternoon', 'evening']),
          packageType: randomItem(['basic', 'premium', 'elite']),
          status,
          statusHistory: [{ status: 'assigned', changedAt: date, remark: 'Task created' }],
          ...(status === 'completed' ? {
            actualStartTime: date,
            actualEndTime: new Date(date.getTime() + 3600000),
            cleanerEarnings: randomNum(50, 100),
            customerPaymentStatus: 'paid',
          } : {}),
        });
      }
      await Task.insertMany(batch);
      created += batchSize;
      console.log(`  ... ${created}/500 tasks`);
    }
    console.log(`  ✓ Created 500 tasks total`);
  } else {
    console.log(`  - ${taskCount} tasks already exist, skipping`);
  }

  // ─── Attendance (200 records) ───
  const attCount = await Attendance.countDocuments();
  if (attCount < 200) {
    console.log('📌 Creating attendance records...');
    let created = await Attendance.countDocuments();
    while (created < 200) {
      const batch = [];
      const batchSize = Math.min(50, 200 - created);
      for (let j = 0; j < batchSize; j++) {
        const i = created + j;
        const cleaner = allCleaners[i % allCleaners.length];
        const date = randomDate(30, 1);
        const status = randomItem(['present', 'present', 'present', 'present', 'absent', 'late', 'half-day']);
        const checkInTime = new Date(date);
        checkInTime.setHours(randomNum(7, 10), randomNum(0, 59), 0);
        const checkOutTime = new Date(date);
        checkOutTime.setHours(randomNum(16, 19), randomNum(0, 59), 0);
        const workingMinutes = Math.round((checkOutTime - checkInTime) / 60000);

        batch.push({
          cleanerId: cleaner._id,
          date,
          status,
          checkIn: { time: checkInTime, isLate: status === 'late', lateMinutes: status === 'late' ? randomNum(5, 60) : 0 },
          checkOut: { time: checkOutTime },
          summary: { totalWorkingMinutes: workingMinutes, effectiveWorkingMinutes: workingMinutes - randomNum(0, 30), overtimeMinutes: randomNum(0, 30) },
        });
      }
      await Attendance.insertMany(batch);
      created += batchSize;
      console.log(`  ... ${created}/200 attendance records`);
    }
    console.log(`  ✓ Created 200 attendance records total`);
  }

  // ─── Payments (300 total) ───
  const payCount = await Payment.countDocuments();
  if (payCount < 300) {
    console.log('📌 Creating payment records...');
    let created = await Payment.countDocuments();
    while (created < 300) {
      const batch = [];
      const batchSize = Math.min(100, 300 - created);
      for (let j = 0; j < batchSize; j++) {
        const i = created + j;
        const customer = allCustomers[i % allCustomers.length];
        batch.push({
          amount: randomNum(200, 5000),
          purpose: randomItem(['subscription', 'service_booking', 'wallet_topup', 'service_booking', 'service_booking']),
          status: randomItem(['created', 'captured', 'captured', 'captured', 'captured', 'failed', 'refunded']),
          payerId: customer._id,
          payerType: 'customer',
          receipt: `receipt_${4000 + i}`,
        });
      }
      await Payment.insertMany(batch);
      created += batchSize;
      console.log(`  ... ${created}/300 payments`);
    }
    console.log(`  ✓ Created 300 payments total`);
  }

  // ─── Complaints (50 total) ───
  const compCount = await Complaint.countDocuments();
  if (compCount < 50) {
    console.log('📌 Creating complaints...');
    const existing = await Complaint.countDocuments();
    const categories = ['service_quality', 'cleaner_behavior', 'billing', 'scheduling', 'other'];
    const descriptions = [
      'The car was not properly cleaned after service.',
      'Cleaner arrived late and rushed through the job.',
      'Minor scratch noticed on the door after washing.',
      'Charged more than the quoted price.',
      'Service quality was below expectations.',
      'The interior was not vacuumed properly.',
      'Engine bay cleaning was incomplete.',
      'Dashboard was left dusty after service.',
      'Polishing left swirl marks on the paint.',
      'AC service did not resolve the cooling issue.',
      'Wheels were not cleaned properly.',
      'Customer service response was very slow.',
      'Booking was delayed by over 2 hours.',
      'The cleaning products used had a strong smell.',
      'Windshield was left with streaks after cleaning.',
    ];
    const batch = [];
    for (let i = existing; i < 50; i++) {
      const customer = allCustomers[i % allCustomers.length];
      batch.push({
        ticketNumber: `CMP-${String(5000 + i)}`,
        customerId: customer._id,
        category: randomItem(categories),
        description: randomItem(descriptions),
        priority: randomItem(['low', 'medium', 'high', 'high']),
        status: randomItem(['open', 'in_progress', 'resolved', 'closed']),
      });
    }
    await Complaint.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} complaints (total: ${50})`);
  }

  // ─── Issues (50 total) ───
  const issueCount = await Issue.countDocuments();
  if (issueCount < 50) {
    console.log('📌 Creating issues...');
    const existing = await Issue.countDocuments();
    const batch = [];
    for (let i = existing; i < 50; i++) {
      const cleaner = allCleaners[i % allCleaners.length];
      batch.push({
        ticketNumber: `ISS-${String(6000 + i)}`,
        reportedBy: cleaner._id,
        category: randomItem(['vehicle_locked', 'vehicle_missing', 'customer_complaint', 'qr_damaged', 'payment_issue', 'other']),
        description: `Operational issue: ${randomItem([
          'Vehicle not found at location',
          'QR code damaged on vehicle',
          'Customer not reachable at pickup time',
          'Payment pending for previous service',
          'Equipment malfunction - vacuum cleaner',
          'Customer changed address after booking',
          'Key handover issue with apartment security',
        ])}`,
        priority: randomItem(['low', 'medium', 'high', 'critical']),
        status: randomItem(['open', 'open', 'in_progress', 'resolved', 'closed']),
        timeline: [{ status: 'open', note: 'Issue created', updatedAt: randomDate(30, 1) }],
      });
    }
    await Issue.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} issues (total: ${50})`);
  }

  // ─── Notifications (100 total) ───
  const notifCount = await Notification.countDocuments();
  if (notifCount < 100) {
    console.log('📌 Creating notifications...');
    const batch = [];
    for (let i = 0; i < 100; i++) {
      const recipient = allUsers[i % allUsers.length];
      const notifType = randomItem(NOTIF_TYPES);
      batch.push({
        recipientId: recipient._id,
        recipientRole: recipient.role,
        type: notifType,
        title: `Notification #${i + 1}: ${notifType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
        body: `This is a sample ${notifType.replace(/_/g, ' ')} notification generated for testing purposes.`,
        priority: randomItem(['low', 'normal', 'high']),
        isRead: i < 40,
        readAt: i < 40 ? randomDate(10, 0) : undefined,
        pushSent: true,
        pushSentAt: randomDate(30, 0),
        pushDelivered: true,
      });
    }
    await Notification.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} notifications (total: ${100})`);
  }

  // ─── Earnings (200 records) ───
  const earCount = await Earnings.countDocuments();
  if (earCount < 200) {
    console.log('📌 Creating earnings records...');
    let created = await Earnings.countDocuments();
    while (created < 200) {
      const batch = [];
      const batchSize = Math.min(50, 200 - created);
      for (let j = 0; j < batchSize; j++) {
        const i = created + j;
        const cleaner = allCleaners[i % allCleaners.length];
        const base = randomNum(500, 5000);
        const incentive = randomNum(0, 500);
        batch.push({
          cleanerId: cleaner._id,
          baseAmount: base,
          incentiveAmount: incentive,
          netAmount: base + incentive,
          periodType: i % 3 === 0 ? 'weekly' : 'monthly',
          periodStart: randomDate(90, 30),
          periodEnd: randomDate(29, 1),
          paymentStatus: randomItem(['pending', 'processed', 'paid', 'paid']),
          breakdown: { perTaskRate: 50, taskCount: randomNum(10, 50), incentiveRate: 0, overtimeRate: 0 },
        });
      }
      await Earnings.insertMany(batch);
      created += batchSize;
      console.log(`  ... ${created}/200 earnings records`);
    }
    console.log(`  ✓ Created 200 earnings records total`);
  }

  // ─── Subscription Packages (4 total) ───
  const subPkgCount = await SubscriptionPackage.countDocuments();
  if (subPkgCount === 0) {
    console.log('📌 Creating subscription packages...');
    const packages = await SubscriptionPackage.insertMany([
      { name: 'Basic Monthly', code: 'BASIC-M', price: 999, discountPrice: 899, cleaningsPerMonth: 10, durationMonths: 1, services: [{ name: 'Exterior Wash', included: true }], features: ['Exterior Cleaning', 'Tire Dressing'], isPopular: false, sortOrder: 1 },
      { name: 'Standard Monthly', code: 'STD-M', price: 1499, discountPrice: 1299, cleaningsPerMonth: 20, durationMonths: 1, services: [{ name: 'Exterior Wash', included: true }, { name: 'Interior Vacuum', included: true }], features: ['Daily Exterior', 'Weekly Interior'], isPopular: true, sortOrder: 2 },
      { name: 'Premium Monthly', code: 'PREM-M', price: 2499, discountPrice: 1999, cleaningsPerMonth: 30, durationMonths: 1, services: [{ name: 'Exterior Wash', included: true }, { name: 'Interior Vacuum', included: true }, { name: 'Waxing', included: true }], features: ['Daily Exterior', 'Bi-weekly Interior', 'Monthly Waxing'], isPopular: true, sortOrder: 3 },
      { name: 'Premium Quarterly', code: 'PREM-Q', price: 6999, discountPrice: 5499, cleaningsPerMonth: 90, durationMonths: 3, services: [{ name: 'Exterior Wash', included: true }, { name: 'Interior Vacuum', included: true }, { name: 'Waxing', included: true }], features: ['Daily Exterior', 'Bi-weekly Interior', 'Monthly Waxing', 'Quarterly Polish'], isPopular: false, sortOrder: 4 },
    ]);
    console.log(`  ✓ Created ${packages.length} subscription packages`);
  }

  // ─── Subscriptions (100 total) ───
  const subCount = await Subscription.countDocuments();
  if (subCount < 100) {
    console.log('📌 Creating subscriptions...');
    const existing = await Subscription.countDocuments();
    const allPkgs = await SubscriptionPackage.find();
    const batch = [];
    const supervisors = allUsers.filter(u => u.role === 'supervisor' || u.role === 'admin' || u.role === 'manager');
    const apts = await Apartment.find();
    const vehs = await mongoose.model('Vehicle').find();
    
    for (let i = existing; i < 100; i++) {
      const customer = allCustomers[i % allCustomers.length];
      const vehicle = vehs[i % vehs.length];
      const apt = apts[i % apts.length];
      const pkg = allPkgs[i % allPkgs.length];
      const cleaner = allCleaners[i % allCleaners.length];
      const supervisor = supervisors[i % supervisors.length] || allUsers[0];
      
      const statusOptions = ['active', 'active', 'active', 'expired', 'cancelled', 'pending'];
      const status = statusOptions[i % statusOptions.length];
      
      const startDate = randomDate(90, 0);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + pkg.durationMonths);
      
      const totalAmount = pkg.discountPrice;
      const gstAmount = Math.round(totalAmount * 0.18);
      const netAmount = totalAmount + gstAmount;
      
      batch.push({
        subscriptionId: `SUB-${String(1000 + i).padStart(4, '0')}`,
        customerId: customer._id,
        vehicleId: vehicle._id,
        apartmentId: apt ? apt._id : undefined,
        packageId: pkg._id,
        packageType: ['basic', 'premium', 'elite'][i % 3],
        packageName: pkg.name,
        frequency: 'monthly',
        totalAmount,
        discount: pkg.price - pkg.discountPrice,
        discountType: 'fixed',
        gstAmount,
        netAmount,
        paymentAmount: netAmount,
        paymentMode: randomItem(['UPI', 'Credit Card', 'Net Banking']),
        startDate,
        endDate,
        durationMonths: pkg.durationMonths,
        totalCleanings: pkg.cleaningsPerMonth,
        usedCleanings: randomNum(0, pkg.cleaningsPerMonth),
        remainingCleanings: pkg.cleaningsPerMonth - randomNum(0, pkg.cleaningsPerMonth),
        remainingServices: 2,
        status,
        autoRenew: i % 2 === 0,
        cleanerId: cleaner._id,
        supervisorId: supervisor._id,
        cancelledAt: status === 'cancelled' ? randomDate(30, 0) : undefined,
      });
    }
    await Subscription.insertMany(batch);
    console.log(`  ✓ Created ${batch.length} subscriptions (total: ${100})`);
  }

  // ─── Training Videos (unchanged, keep existing) ───
  const trainCount = await TrainingVideo.countDocuments();
  if (trainCount === 0) {
    console.log('📌 Creating training modules...');
    const TRAINING_TITLES = ['Exterior Wash Techniques', 'Interior Vacuuming', 'Customer Service Excellence', 'Safety First', 'Advanced Polishing', 'Engine Bay Cleaning', 'Glass & Mirror Cleaning', 'Waterless Wash Methods', 'Time Management', 'Quality Standards'];
    const TRAINING_CATEGORIES = ['exterior_cleaning', 'interior_cleaning', 'customer_handling', 'safety_training', 'advanced'];
    const videos = await TrainingVideo.insertMany(
      TRAINING_TITLES.map((title, i) => ({
        title,
        description: `Learn about ${title.toLowerCase()} with this comprehensive training module.`,
        category: TRAINING_CATEGORIES[i % TRAINING_CATEGORIES.length],
        duration: randomNum(5, 30),
        isMandatory: i < 3,
        hasQuiz: i % 2 === 0,
        passingScore: 70,
        order: i + 1,
        isActive: true,
        points: randomNum(10, 50),
      }))
    );
    console.log(`  ✓ Created ${videos.length} training modules`);
  }

  // ─── Service Categories ───
  const catCount = await ServiceCategory.countDocuments();
  if (catCount === 0) {
    console.log('📌 Creating service categories...');
    const categories = await ServiceCategory.insertMany(
      CATEGORY_NAMES.map((name, i) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} service category`,
        sortOrder: i + 1,
        isPopular: i < 4,
        isActive: true,
      }))
    );
    console.log(`  ✓ Created ${categories.length} service categories`);
  }

  // ─── Service Providers ───
  const provCount = await ServiceProvider.countDocuments();
  if (provCount === 0) {
    console.log('📌 Creating service providers...');
    const categories = await ServiceCategory.find();
    const providers = await ServiceProvider.insertMany(
      PROVIDER_NAMES.map((name, i) => ({
        name,
        ownerName: OWNER_NAMES[i],
        phone: `+9196${String(10000000 + i).slice(0, 8)}`,
        email: `provider${i}@gmail.com`,
        description: `${name} - professional car cleaning services`,
        address: { street: 'Service Road', city: CITIES[i % CITIES.length], state: 'Maharashtra', pincode: '400001' },
        categories: [categories[i % categories.length]._id],
        verified: i % 3 !== 0,
        averageRating: randomNum(35, 50) / 10,
        totalBookings: randomNum(50, 500),
        isActive: true,
      }))
    );
    console.log(`  ✓ Created ${providers.length} service providers`);
  }

  // ─── Settings ───
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    console.log('📌 Creating default settings...');
    const DEFAULT_SETTINGS = {
      general: { appName: 'GoMotarCar', supportEmail: 'support@gomotarcar.com', supportPhone: '+919876543210', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY', currency: 'INR', language: 'en' },
      business: { businessName: 'GoMotarCar India', gstNumber: '', panNumber: '', address: 'Mumbai, Maharashtra', operatingHours: '8:00 AM - 8:00 PM', holidays: 'Sunday' },
      payment: { cleaningRate: '50', premiumRate: '75', eliteRate: '100', commissionPercent: '10', payoutDay: '15', minimumPayout: '500', lateFee: '0', taxPercent: '18' },
      notification: { emailNotifications: true, smsNotifications: true, pushNotifications: true, reminderBeforeHours: '24', taskAssignmentAlert: true, attendanceAlert: true, paymentAlert: true },
      razorpay: { razorpayKeyId: '', razorpayKeySecret: '', razorpayWebhookSecret: '', enableTestMode: true },
      firebase: { firebaseApiKey: '', firebaseAuthDomain: '', firebaseProjectId: '', firebaseStorageBucket: '', firebaseMessagingSenderId: '', firebaseAppId: '' },
      security: { maxLoginAttempts: '5', lockoutDurationMinutes: '30', sessionTimeoutHours: '24', passwordMinLength: '8', twoFactorAuth: false, requireEmailVerification: true },
    };
    let count = 0;
    for (const [group, values] of Object.entries(DEFAULT_SETTINGS)) {
      for (const [key, value] of Object.entries(values)) {
        await Settings.create({ group, key, value, description: `${group} ${key} setting` });
        count++;
      }
    }
    console.log(`  ✓ Created ${count} settings`);
  }

  console.log('\n✅ Seeding complete!');
  console.log('   Demo credentials:');
  console.log('   ├─ Admin:     admin@gomotarcar.com / admin123');
  console.log('   ├─ Manager:   manager@gomotarcar.com / admin123');
  console.log('   ├─ Customer:  customer0@gmail.com / password123 (0-99)');
  console.log('   ├─ Cleaner:   cleaner0@gmail.com / password123 (0-49)');
  console.log('   └─ Franchise: franchise0@gmail.com / password123 (0-19)\n');
}

// Export for auto-seed from server startup
module.exports = { seed };

// Allow running directly via `node src/seed.js`
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
