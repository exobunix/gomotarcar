/**
 * GoMotarCar Subscription Management Seeding Script
 * 
 * Run with: node src/seed-subscriptions.js
 */

const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Customer = require('./models/Customer');
const Cleaner = require('./models/Cleaner');
const Supervisor = require('./models/Supervisor');
const Apartment = require('./models/Apartment');
const SubscriptionPackage = require('./models/SubscriptionPackage');
const Subscription = require('./models/Subscription');
const Vehicle = require('./models/Vehicle');
const Payment = require('./models/Payment');

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (startDaysAgo, endDaysAgo) => {
  const start = new Date();
  start.setDate(start.getDate() - startDaysAgo);
  const end = new Date();
  end.setDate(end.getDate() - endDaysAgo);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Lists of names
const MALE_FIRST_NAMES = [
  'Rahul', 'Amit', 'Vijay', 'Sunil', 'Ravi', 'Manish', 'Deepak', 'Sandeep', 'Ajay', 'Nitin',
  'Alok', 'Pankaj', 'Rajesh', 'Suresh', 'Mahesh', 'Vikram', 'Anil', 'Sachin', 'Gaurav', 'Rohit',
  'Karan', 'Akash', 'Arvind', 'Dinesh', 'Sanjay', 'Abhishek', 'Pradeep', 'Manoj', 'Kiran', 'Harish',
  'Yogesh', 'Ramesh', 'Kamlesh', 'Naresh', 'Aadesh', 'Brijesh', 'Ganesh', 'Jinesh', 'Lokesh', 'Mitesh',
  'Piyush', 'Rakesh', 'Shailesh', 'Umesh', 'Yash', 'Aniket', 'Bhavesh', 'Chirag', 'Darshan', 'Girish'
];

const FEMALE_FIRST_NAMES = [
  'Priya', 'Ananya', 'Neha', 'Pooja', 'Sneha', 'Ritu', 'Kavita', 'Anita', 'Shweta', 'Divya',
  'Kajal', 'Nandini', 'Meera', 'Rashmi', 'Shalini', 'Preeti', 'Nisha', 'Sheetal', 'Pallavi', 'Swati',
  'Komal', 'Jyoti', 'Deepika', 'Sangeeta', 'Anjali', 'Radha', 'Seema', 'Sarita', 'Renu', 'Bhavna',
  'Indira', 'Jaya', 'Kritika', 'Lavanya', 'Madhu', 'Parul', 'Suhani', 'Tanvi', 'Urvashi', 'Vidya'
];

const SURNAMES = [
  'Kumar', 'Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Yadav', 'Joshi', 'Tiwari', 'Chauhan',
  'Mishra', 'Pandey', 'Dubey', 'Saxena', 'Trivedi', 'Bhatt', 'Thakur', 'Mehta', 'Jain', 'Das',
  'Reddy', 'Naidu', 'Iyer', 'Nair', 'Pillai', 'Rao'
];

const APARTMENT_SOCIETIES = [
  'Green View Heights', 'Skyline Residency', 'Lake Vista', 'Royal Palm', 'Silver Oak',
  'Golden Nest', 'Crystal Heights', 'Blue Ridge', 'Maple Garden', 'Palm Grove',
  'Ivy Terrace', 'Rosewood Estate', 'Cedar Court', 'Willow Creek', 'Magnolia Residency',
  'Jasmine Manor', 'Orchid Enclave', 'Lily Heights', 'Lotus Garden', 'Daisy Park',
  'Pine Crest', 'Sunflower Enclave', 'Tulip Apartments', 'Ocean View', 'Windsor Castle'
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];

const VEHICLE_MAKES = ['Maruti', 'Hyundai', 'Honda', 'Kia', 'Mahindra', 'Tata', 'Toyota'];
const VEHICLE_MODELS = {
  'Maruti': ['Swift', 'Alto', 'WagonR', 'Baleno', 'Dzire', 'Brezza'],
  'Hyundai': ['i10', 'i20', 'Creta', 'Venue', 'Verna'],
  'Honda': ['City', 'Amaze', 'Civic', 'Jazz'],
  'Kia': ['Seltos', 'Sonet', 'Carens'],
  'Mahindra': ['Thar', 'XUV700', 'Scorpio', 'Bolero'],
  'Tata': ['Nexon', 'Punch', 'Harrier', 'Altroz', 'Safari'],
  'Toyota': ['Fortuner', 'Innova', 'Glanza', 'Urban Cruiser']
};

const VEHICLE_TYPES = ['hatchback', 'sedan', 'suv', 'luxury', 'ev'];

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB. Beginning Subscription Module seeding...');

  // 1. Clear existing collections to make counts exact
  console.log('Clearing existing records...');
  await Subscription.deleteMany({});
  await SubscriptionPackage.deleteMany({});
  await Vehicle.deleteMany({});
  await Apartment.deleteMany({});
  await Customer.deleteMany({});
  await Cleaner.deleteMany({});
  await Supervisor.deleteMany({});
  // Clear non-admin users
  await User.deleteMany({ role: { $in: ['customer', 'cleaner', 'supervisor'] } });

  // 2. Create 15 SubscriptionPackages
  console.log('Creating 15 Packages...');
  const packagesData = [
    { name: 'Basic Monthly', code: 'BASIC_M', price: 999, discountPrice: 899, cleaningsPerMonth: 4, durationMonths: 1, features: ['4 Cleanings/mo', 'Basic Wash', 'Vacuuming'] },
    { name: 'Premium Monthly', code: 'PREMIUM_M', price: 1999, discountPrice: 1799, cleaningsPerMonth: 8, durationMonths: 1, features: ['8 Cleanings/mo', 'Premium Wash', 'Wax & Polish', 'Interior Detailing'] },
    { name: 'Elite Monthly', code: 'ELITE_M', price: 2999, discountPrice: 2699, cleaningsPerMonth: 12, durationMonths: 1, features: ['12 Cleanings/mo', 'Elite Wash', 'Engine Bay Wash', 'Leather Conditioning', 'AC Sanitization'] },
    { name: 'Platinum Monthly', code: 'PLATINUM_M', price: 3999, discountPrice: 3599, cleaningsPerMonth: 20, durationMonths: 1, features: ['20 Cleanings/mo', 'All-Inclusive Cleaning', 'Underbody Wash', 'Priority Scheduling'] },
    { name: 'Free Trial', code: 'FREE_TRIAL', price: 0, discountPrice: 0, cleaningsPerMonth: 2, durationMonths: 1, features: ['2 Cleanings', 'Trial Pack'] },
    
    { name: 'Basic Quarterly', code: 'BASIC_Q', price: 2799, discountPrice: 2499, cleaningsPerMonth: 4, durationMonths: 3, features: ['4 Cleanings/mo', 'Basic Wash', 'Vacuuming'] },
    { name: 'Premium Quarterly', code: 'PREMIUM_Q', price: 5499, discountPrice: 4999, cleaningsPerMonth: 8, durationMonths: 3, features: ['8 Cleanings/mo', 'Premium Wash', 'Wax & Polish', 'Interior Detailing'] },
    { name: 'Elite Quarterly', code: 'ELITE_Q', price: 8499, discountPrice: 7999, cleaningsPerMonth: 12, durationMonths: 3, features: ['12 Cleanings/mo', 'Elite Wash', 'Engine Bay Wash', 'AC Sanitization'] },
    { name: 'Platinum Quarterly', code: 'PLATINUM_Q', price: 10999, discountPrice: 9999, cleaningsPerMonth: 20, durationMonths: 3, features: ['20 Cleanings/mo', 'All-Inclusive Cleaning', 'Priority Scheduling'] },
    
    { name: 'Basic Half Yearly', code: 'BASIC_H', price: 4999, discountPrice: 4499, cleaningsPerMonth: 4, durationMonths: 6, features: ['4 Cleanings/mo', 'Basic Wash', 'Vacuuming'] },
    { name: 'Premium Half Yearly', code: 'PREMIUM_H', price: 9999, discountPrice: 8999, cleaningsPerMonth: 8, durationMonths: 6, features: ['8 Cleanings/mo', 'Premium Wash', 'Wax & Polish', 'Interior Detailing'] },
    { name: 'Elite Half Yearly', code: 'ELITE_H', price: 15999, discountPrice: 14999, cleaningsPerMonth: 12, durationMonths: 6, features: ['12 Cleanings/mo', 'Elite Wash', 'Engine Bay Wash', 'AC Sanitization'] },
    
    { name: 'Basic Yearly', code: 'BASIC_Y', price: 8999, discountPrice: 7999, cleaningsPerMonth: 4, durationMonths: 12, features: ['4 Cleanings/mo', 'Basic Wash', 'Vacuuming'] },
    { name: 'Premium Yearly', code: 'PREMIUM_Y', price: 17999, discountPrice: 15999, cleaningsPerMonth: 8, durationMonths: 12, features: ['8 Cleanings/mo', 'Premium Wash', 'Wax & Polish', 'Interior Detailing'] },
    { name: 'Elite Yearly', code: 'ELITE_Y', price: 28999, discountPrice: 25999, cleaningsPerMonth: 12, durationMonths: 12, features: ['12 Cleanings/mo', 'Elite Wash', 'Engine Bay Wash', 'AC Sanitization'] }
  ];

  const packages = await SubscriptionPackage.insertMany(packagesData);
  console.log(`✓ Seeded ${packages.length} packages.`);

  // 3. Create 20 Supervisors
  console.log('Creating 20 Supervisors...');
  const supervisors = [];
  for (let i = 1; i <= 20; i++) {
    const phone = `+91950000${String(100 + i)}`;
    const email = `supervisor${i}@gomotarcar.com`;
    const user = await User.create({
      phone,
      email,
      passwordHash: 'admin123',
      role: 'supervisor',
      isActive: true,
      isVerified: true,
      phoneVerified: true
    });

    const firstName = randomItem(MALE_FIRST_NAMES);
    const lastName = randomItem(SURNAMES);
    const supervisor = await Supervisor.create({
      userId: user._id,
      firstName,
      lastName,
      phone,
      email,
      isActive: true,
      joiningDate: randomDate(365, 30)
    });
    supervisors.push(supervisor);
  }
  console.log(`✓ Seeded ${supervisors.length} supervisors.`);

  // 4. Create 50 Cleaners
  console.log('Creating 50 Cleaners...');
  const cleaners = [];
  for (let i = 1; i <= 50; i++) {
    const phone = `+91940000${String(100 + i)}`;
    const email = `cleaner${i}@gomotarcar.com`;
    const user = await User.create({
      phone,
      email,
      passwordHash: 'password123',
      role: 'cleaner',
      isActive: true,
      isVerified: true,
      phoneVerified: true
    });

    const firstName = randomItem(MALE_FIRST_NAMES);
    const lastName = randomItem(SURNAMES);
    const cleanerId = `GMC-CL-${String(4000 + i)}`;
    const supervisor = supervisors[i % supervisors.length];

    const cleaner = await Cleaner.create({
      userId: user._id,
      firstName,
      lastName,
      phone,
      email,
      cleanerId,
      supervisorId: supervisor.userId, // references user id
      isActive: true,
      verificationStatus: 'verified',
      joiningDate: randomDate(365, 30),
      stats: {
        totalTasksCompleted: randomNum(50, 500),
        totalEarnings: randomNum(5000, 100000),
        averageRating: randomNum(35, 50) / 10
      }
    });
    cleaners.push(cleaner);
  }
  console.log(`✓ Seeded ${cleaners.length} cleaners.`);

  // 5. Create 100 Customers
  console.log('Creating 100 Customers...');
  const customers = [];
  for (let i = 1; i <= 100; i++) {
    const phone = `+91990000${String(100 + i)}`;
    const email = `customer${i}@gmail.com`;
    const user = await User.create({
      phone,
      email,
      passwordHash: 'password123',
      role: 'customer',
      isActive: true,
      isVerified: true,
      phoneVerified: true
    });

    const firstName = randomItem(i % 2 === 0 ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
    const lastName = randomItem(SURNAMES);

    const customer = await Customer.create({
      userId: user._id,
      firstName,
      lastName,
      phone,
      email,
      subscriptionStatus: 'none',
      totalSpent: 0
    });
    customers.push(customer);
  }
  console.log(`✓ Seeded ${customers.length} customers.`);

  // 6. Create 25 Apartments
  console.log('Creating 25 Apartments...');
  const apartments = [];
  for (let i = 1; i <= 25; i++) {
    const customer = customers[i - 1]; // One customer assigned as customerId
    const society = APARTMENT_SOCIETIES[i - 1];
    const city = randomItem(CITIES);
    const apartment = await Apartment.create({
      customerId: customer._id,
      name: society,
      tower: `Tower ${String.fromCharCode(65 + (i % 5))}`,
      flatNumber: `${100 + i}`,
      society: society,
      city,
      state: 'Maharashtra',
      pincode: String(400000 + randomNum(1, 999)).padStart(6, '0'),
      coordinates: { type: 'Point', coordinates: [72.8777, 19.0760] },
      isDefault: true,
      isActive: true
    });
    apartments.push(apartment);
  }
  console.log(`✓ Seeded ${apartments.length} apartments.`);

  // 7. Create 200 Vehicles
  console.log('Creating 200 Vehicles...');
  const vehicles = [];
  for (let i = 1; i <= 200; i++) {
    const customer = customers[i % customers.length];
    const make = randomItem(VEHICLE_MAKES);
    const model = randomItem(VEHICLE_MODELS[make]);
    const vehicleType = randomItem(VEHICLE_TYPES);
    const prefix = String.fromCharCode(65 + (i % 26)) + String.fromCharCode(65 + ((i + 3) % 26));
    const num = String(1000 + i).slice(-4);
    const stateCode = randomItem(['MH', 'KA', 'DL', 'HR', 'TS']);
    const vehicleNumber = `${stateCode} 0${randomNum(1, 9)} ${prefix} ${num}`;

    const vehicle = await Vehicle.create({
      customerId: customer._id,
      vehicleNumber,
      make,
      model,
      vehicleType,
      year: randomNum(2018, 2025),
      color: randomItem(['White', 'Black', 'Grey', 'Silver', 'Red', 'Blue']),
      isActive: true
    });
    vehicles.push(vehicle);
  }
  console.log(`✓ Seeded ${vehicles.length} vehicles.`);

  // 8. Generate Subscriptions
  // Target: 500 Active, 100 Expired, 50 Cancelled, 50 Pending
  console.log('Generating 700 Subscriptions...');
  let totalSubCount = 0;
  
  const generateSubscriptionRecord = async (status, index) => {
    totalSubCount++;
    const subscriptionId = `SUB-${String(totalSubCount).padStart(4, '0')}`;
    const customer = randomItem(customers);
    
    // Find customer's vehicle
    const customerVehicles = vehicles.filter(v => v.customerId.toString() === customer._id.toString());
    const vehicle = customerVehicles.length > 0 ? randomItem(customerVehicles) : randomItem(vehicles);
    
    const pkg = randomItem(packages);
    const apartment = randomItem(apartments);
    const cleaner = randomItem(cleaners);
    const supervisor = randomItem(supervisors);

    let startDate, endDate;
    if (status === 'active') {
      startDate = randomDate(20, 1);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (pkg.durationMonths || 1));
    } else if (status === 'expired') {
      startDate = randomDate(60, 35);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (pkg.durationMonths || 1));
    } else if (status === 'cancelled') {
      startDate = randomDate(45, 15);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (pkg.durationMonths || 1));
    } else { // pending
      startDate = new Date();
      startDate.setDate(startDate.getDate() + randomNum(1, 5));
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (pkg.durationMonths || 1));
    }

    const totalCleanings = pkg.cleaningsPerMonth * (pkg.durationMonths || 1);
    const usedCleanings = status === 'expired' ? totalCleanings : status === 'active' ? randomNum(0, totalCleanings - 1) : 0;
    const remainingCleanings = totalCleanings - usedCleanings;

    const paymentAmount = pkg.discountPrice || pkg.price;
    const paymentMode = randomItem(['UPI', 'Card', 'Net Banking', 'Cash']);

    const sub = await Subscription.create({
      subscriptionId,
      customerId: customer._id,
      vehicleId: vehicle._id,
      apartmentId: apartment._id,
      packageId: pkg._id,
      packageType: pkg.code.toLowerCase().includes('basic') ? 'basic' : pkg.code.toLowerCase().includes('premium') ? 'premium' : 'elite',
      packageName: pkg.name,
      frequency: 'monthly',
      totalAmount: pkg.price,
      netAmount: paymentAmount,
      paymentAmount,
      paymentMode,
      startDate,
      endDate,
      durationMonths: pkg.durationMonths,
      totalCleanings,
      usedCleanings,
      remainingCleanings,
      remainingServices: remainingCleanings,
      status,
      cleanerId: cleaner._id,
      supervisorId: supervisor.userId, // references user id
      cancellationReason: status === 'cancelled' ? 'Customer relocated' : undefined,
      cancelledAt: status === 'cancelled' ? randomDate(10, 1) : undefined,
      cancelledBy: status === 'cancelled' ? 'customer' : undefined
    });

    // If active, update customer activeSubscriptionId and vehicle subscriptionId
    if (status === 'active') {
      customer.activeSubscriptionId = sub._id;
      customer.subscriptionStatus = 'active';
      customer.cleaningBalance += remainingCleanings;
      customer.totalSpent += paymentAmount;
      await customer.save();

      vehicle.subscriptionId = sub._id;
      await vehicle.save();
    }
  };

  console.log('Generating 500 active...');
  for (let i = 0; i < 500; i++) {
    await generateSubscriptionRecord('active', i);
  }

  console.log('Generating 100 expired...');
  for (let i = 0; i < 100; i++) {
    await generateSubscriptionRecord('expired', i);
  }

  console.log('Generating 500 cancelled...'); // Wait, the request specifies exactly 50 cancelled and 50 pending
  console.log('Generating 50 cancelled...');
  for (let i = 0; i < 50; i++) {
    await generateSubscriptionRecord('cancelled', i);
  }

  console.log('Generating 50 pending...');
  for (let i = 0; i < 50; i++) {
    await generateSubscriptionRecord('pending', i);
  }

  console.log(`✓ Seeded ${totalSubCount} total subscriptions.`);

  console.log('DB Seeding complete! Database is populated with subscription test records.');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
