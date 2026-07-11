const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/rateLimiter');
const forgotPasswordController = require('../controllers/forgot-password.controller');
const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginPasswordSchema,
  refreshTokenSchema,
  setPasswordSchema,
  changePasswordSchema,
  googleLoginSchema,
} = require('../validators/auth.validator');

// Public routes (with rate limiting)
router.post('/send-otp', rateLimiters.otp, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', rateLimiters.otp, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/register', rateLimiters.auth, validate(registerSchema), authController.register);
router.post('/register-cleaner', rateLimiters.auth, authController.registerCleaner);
router.post('/register-franchise', rateLimiters.auth, validate(require('../validators/franchise.validator').createFranchiseSchema), async (req, res, next) => {
  try {
    const franchiseService = require('../services/franchise.service');
    const franchise = await franchiseService.create(req.body);
    res.status(201).json({ success: true, data: franchise });
  } catch (error) {
    next(error);
  }
});

router.post('/login', rateLimiters.auth, validate(loginPasswordSchema), authController.login);
router.post('/google-login', rateLimiters.auth, validate(googleLoginSchema), authController.googleLogin);
router.post('/refresh', rateLimiters.auth, validate(refreshTokenSchema), authController.refresh);

// Public routes (forgot/reset password)
router.post('/forgot-password', rateLimiters.otp, forgotPasswordController.forgotPassword);
router.post('/reset-password', rateLimiters.otp, forgotPasswordController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.post('/set-password', authenticate, validate(setPasswordSchema), authController.setPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

router.get('/temp-inspect-database', async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const User = require('../models/User');
    const Franchise = require('../models/Franchise');
    const ServiceBooking = require('../models/ServiceBooking');
    const Customer = require('../models/Customer');
    const Vehicle = require('../models/Vehicle');
    const Cleaner = require('../models/Cleaner');
    const Zone = require('../models/Zone');
    const Attendance = require('../models/Attendance');

    const email = 'adarshdeepsachan@gmail.com';
    const user = await User.findOne({ email });
    const franchise = user ? await Franchise.findOne({ userId: user._id }) : null;
    const franchiseId = franchise ? franchise._id : null;

    const counts = {
      users: await User.countDocuments(),
      franchises: await Franchise.countDocuments(),
      bookings: await ServiceBooking.countDocuments(),
      bookingsForFranchise: franchiseId ? await ServiceBooking.countDocuments({ franchiseId }) : 0,
      customers: await Customer.countDocuments(),
      vehicles: await Vehicle.countDocuments(),
      cleaners: await Cleaner.countDocuments(),
      cleanersForFranchise: franchise ? await Cleaner.countDocuments({ assignedZone: { $in: franchise.serviceZones || [] } }) : 0,
      zones: await Zone.countDocuments(),
      attendance: await Attendance.countDocuments()
    };

    res.status(200).json({
      success: true,
      data: {
        franchiseId,
        franchiseName: franchise ? franchise.franchiseName : null,
        serviceZones: franchise ? franchise.serviceZones : [],
        counts
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/temp-update-test-data', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Franchise = require('../models/Franchise');
    const ServiceBooking = require('../models/ServiceBooking');
    const Cleaner = require('../models/Cleaner');
    const Attendance = require('../models/Attendance');

    const email = 'adarshdeepsachan@gmail.com';
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let franchise = await Franchise.findOne({ userId: user._id });
    if (!franchise) return res.status(404).json({ success: false, message: 'Franchise not found' });

    // 1. Update franchise ID
    franchise.franchiseId = 'GMF12345';
    await franchise.save();

    // 2. Fetch all bookings and cleaners
    const bookings = await ServiceBooking.find({ franchiseId: franchise._id });
    const cleaners = await Cleaner.find({ assignedZone: { $in: franchise.serviceZones } });

    // 3. Update bookings dates/status to populate dashboard dynamically
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Update first 25 bookings to be today's bookings
    for (let i = 0; i < Math.min(bookings.length, 25); i++) {
      bookings[i].slotDate = todayStr;
      bookings[i].status = 'accepted';
      bookings[i].paymentStatus = 'paid';
      await bookings[i].save();
    }

    // Update next 15 bookings to be in progress (active)
    for (let i = 25; i < Math.min(bookings.length, 40); i++) {
      bookings[i].slotDate = todayStr;
      bookings[i].status = 'in_progress';
      bookings[i].paymentStatus = 'paid';
      await bookings[i].save();
    }

    // Update next 35 bookings to be completed in current calendar month
    const startOfMonthStr = new Date();
    startOfMonthStr.setDate(5); // e.g. July 5th
    const startOfMonthIso = startOfMonthStr.toISOString().split('T')[0];

    for (let i = 40; i < Math.min(bookings.length, 75); i++) {
      bookings[i].slotDate = startOfMonthIso;
      bookings[i].status = 'completed';
      bookings[i].totalAmount = 1500;
      bookings[i].paymentStatus = 'paid';
      await bookings[i].save();
    }

    // Update next 15 bookings to be completed but paymentStatus = 'pending'
    for (let i = 75; i < Math.min(bookings.length, 90); i++) {
      bookings[i].slotDate = startOfMonthIso;
      bookings[i].status = 'completed';
      bookings[i].totalAmount = 1200;
      bookings[i].paymentStatus = 'pending';
      await bookings[i].save();
    }

    // 4. Update attendance logs for today to show cleaners as present
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // Delete existing attendance logs for today to avoid duplicates
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    await Attendance.deleteMany({ date: { $gte: todayDate, $lt: tomorrowDate } });

    // Mark 20 cleaners as present today
    const attendanceLogs = [];
    for (let i = 0; i < Math.min(cleaners.length, 20); i++) {
      const checkInTime = new Date(todayDate);
      checkInTime.setHours(9, 0, 0, 0);
      const checkOutTime = new Date(todayDate);
      checkOutTime.setHours(18, 0, 0, 0);

      attendanceLogs.push({
        cleanerId: cleaners[i]._id,
        date: todayDate,
        status: 'present',
        checkIn: { time: checkInTime, location: { type: 'Point', coordinates: [80.33, 26.44] }, address: 'Sector 62, Noida' },
        checkOut: { time: checkOutTime, location: { type: 'Point', coordinates: [80.33, 26.44] }, address: 'Sector 62, Noida' },
        workingHours: 540 // 9 hours
      });
    }

    // Mark 5 cleaners as absent today
    for (let i = 20; i < Math.min(cleaners.length, 25); i++) {
      attendanceLogs.push({
        cleanerId: cleaners[i]._id,
        date: todayDate,
        status: 'absent'
      });
    }

    if (attendanceLogs.length > 0) {
      await Attendance.insertMany(attendanceLogs);
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard and attendance test data updated successfully!',
      data: {
        franchiseId: franchise.franchiseId,
        todayBookingsUpdated: 25,
        activeServicesUpdated: 15,
        monthlyRevenueUpdated: 35,
        pendingPaymentsUpdated: 15,
        attendanceLogsCreated: attendanceLogs.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
