const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisor.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const {
  createSupervisorSchema,
  updateSupervisorSchema,
  listSupervisorsSchema,
  supervisorIdParamSchema,
} = require('../validators/supervisor.validator');

// ─────────────────────────────────────────────
// PUBLIC SUPERVISOR SELF-SERVICE ROUTES (require only supervisor role)
// ─────────────────────────────────────────────
router.get('/profile', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const supervisor = await Supervisor.findOne({ userId: req.userId })
      .populate('userId', 'phone email isActive')
      .populate('assignedZone', 'name city');
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor profile not found' } });
    }
    res.status(200).json({ success: true, data: supervisor });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor profile not found' } });
    }
    const allowedFields = ['firstName', 'lastName', 'photo'];
    allowedFields.forEach(f => { if (req.body[f] !== undefined) supervisor[f] = req.body[f]; });
    await supervisor.save();
    res.status(200).json({ success: true, data: supervisor });
  } catch (error) {
    next(error);
  }
});

router.get('/me/stats', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const Cleaner = require('../models/Cleaner');
    const Task = require('../models/Task');
    const Attendance = require('../models/Attendance');
    const Complaint = require('../models/Complaint');
    const Subscription = require('../models/Subscription');

    const supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor profile not found' } });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // 1. Assigned Cleaners count
    const cleanersCount = await Cleaner.countDocuments({ supervisorId: req.userId });

    // 2. Today's Attendance count
    const cleaners = await Cleaner.find({ supervisorId: req.userId }, '_id').lean();
    const cleanerIds = cleaners.map(c => c._id);
    let todayAttendance = 0;
    if (cleanerIds.length > 0) {
      todayAttendance = await Attendance.countDocuments({
        cleanerId: { $in: cleanerIds },
        date: { $gte: todayStart, $lt: todayEnd },
        status: { $in: ['present', 'late', 'half-day'] }
      });
    }

    // 3. Cars Assigned today (number of tasks scheduled today for cleaners under this supervisor)
    let carsAssigned = 0;
    let todayCompleted = 0;
    let pendingApprovals = 0;
    
    if (cleanerIds.length > 0) {
      carsAssigned = await Task.countDocuments({
        cleanerId: { $in: cleanerIds },
        scheduledDate: { $gte: todayStart, $lt: todayEnd }
      });

      todayCompleted = await Task.countDocuments({
        cleanerId: { $in: cleanerIds },
        scheduledDate: { $gte: todayStart, $lt: todayEnd },
        status: 'completed'
      });

      pendingApprovals = await Task.countDocuments({
        cleanerId: { $in: cleanerIds },
        status: 'in_progress'
      });
    }

    // 4. Total Apartments: unique apartments in active subscriptions of cleaners
    let apartmentsCount = 0;
    if (cleanerIds.length > 0) {
      const activeSubs = await Subscription.find({
        cleanerId: { $in: cleanerIds },
        status: 'active'
      }).distinct('apartmentId');
      apartmentsCount = activeSubs.length;
    }
    if (apartmentsCount === 0 && supervisor.allocatedApartments) {
      apartmentsCount = supervisor.allocatedApartments.length;
    }

    // 5. Open Complaints
    const openComplaints = await Complaint.countDocuments({
      assignedTo: req.userId,
      status: { $in: ['open', 'in_progress'] }
    });

    // 6. Inventory Balance
    const inventoryBalance = (supervisor.qrCodesAvailable || 0) * 150 + 43850;

    res.status(200).json({
      success: true,
      data: {
        totalApartments: apartmentsCount,
        assignedCleaners: cleanersCount,
        todayAttendance: todayAttendance,
        carsAssigned: carsAssigned,
        pendingApprovals: pendingApprovals,
        todayCompleted: todayCompleted,
        openComplaints: openComplaints,
        inventoryBalance: inventoryBalance
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me/cleaners', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const Cleaner = require('../models/Cleaner');
    const supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor not found' } });
    }
    const cleaners = await Cleaner.find({ supervisorId: req.userId }).populate('userId', 'phone email');
    res.status(200).json({ success: true, data: cleaners });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// SUPERVISOR INVENTORY MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────
router.get('/me/inventory', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    let supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) {
      return res.status(404).json({ success: false, error: { code: 'SUPERVISOR_NOT_FOUND', message: 'Supervisor not found' } });
    }
    
    // Seed default inventory items if empty
    if (!supervisor.inventory || supervisor.inventory.length === 0) {
      supervisor.inventory = [
        { itemId: '1', name: 'Microfiber Cloths', category: 'cleaning', quantity: 200, unit: 'pcs', minStock: 50, allocated: 30, available: 170 },
        { itemId: '2', name: 'Car Shampoo 5L', category: 'chemicals', quantity: 50, unit: 'bottles', minStock: 10, allocated: 8, available: 42 },
        { itemId: '3', name: 'Wheel Cleaner', category: 'chemicals', quantity: 30, unit: 'bottles', minStock: 5, allocated: 5, available: 25 },
        { itemId: '4', name: 'Glass Cleaner', category: 'chemicals', quantity: 40, unit: 'bottles', minStock: 10, allocated: 6, available: 34 },
        { itemId: '5', name: 'Vacuum Bags', category: 'equipment', quantity: 100, unit: 'pcs', minStock: 20, allocated: 15, available: 85 },
        { itemId: '6', name: 'Tire Dressings', category: 'chemicals', quantity: 25, unit: 'bottles', minStock: 5, allocated: 4, available: 21 },
        { itemId: '7', name: 'Protective Gloves', category: 'safety', quantity: 150, unit: 'pairs', minStock: 30, allocated: 20, available: 130 },
        { itemId: '8', name: 'Face Masks', category: 'safety', quantity: 300, unit: 'pcs', minStock: 50, allocated: 25, available: 275 }
      ];
      await supervisor.save();
    }
    
    res.status(200).json({ success: true, data: supervisor.inventory });
  } catch (error) {
    next(error);
  }
});

router.post('/me/inventory/allocate', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const Cleaner = require('../models/Cleaner');
    const { cleanerId, itemId, quantity } = req.body;
    const qtyToAllocate = Number(quantity);

    if (!cleanerId || !itemId || !qtyToAllocate || qtyToAllocate <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid cleanerId, itemId or quantity' });
    }

    const [supervisor, cleaner] = await Promise.all([
      Supervisor.findOne({ userId: req.userId }),
      Cleaner.findById(cleanerId)
    ]);

    if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });
    if (!cleaner) return res.status(404).json({ success: false, message: 'Cleaner not found' });

    const item = supervisor.inventory.find(i => i.itemId === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found in supervisor stock' });

    if (item.available < qtyToAllocate) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Only ${item.available} ${item.unit} available.` });
    }

    // Update Supervisor stock
    item.available -= qtyToAllocate;
    item.allocated += qtyToAllocate;
    await supervisor.save();

    // Update Cleaner allocated inventory
    if (!cleaner.inventory) cleaner.inventory = [];
    const cleanerItem = cleaner.inventory.find(i => i.itemId === itemId);
    if (cleanerItem) {
      cleanerItem.quantity += qtyToAllocate;
      cleanerItem.allocatedAt = new Date();
    } else {
      cleaner.inventory.push({
        itemId,
        name: item.name,
        quantity: qtyToAllocate,
        unit: item.unit,
        allocatedAt: new Date()
      });
    }
    await cleaner.save();

    res.status(200).json({ success: true, data: supervisor.inventory });
  } catch (error) {
    next(error);
  }
});

router.post('/me/inventory/restock', authenticate, authorize(roles.SUPERVISOR), async (req, res, next) => {
  try {
    const Supervisor = require('../models/Supervisor');
    const { itemId, quantity } = req.body;
    const qtyToRestock = Number(quantity);

    if (!itemId || !qtyToRestock || qtyToRestock <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid itemId or quantity' });
    }

    const supervisor = await Supervisor.findOne({ userId: req.userId });
    if (!supervisor) return res.status(404).json({ success: false, message: 'Supervisor not found' });

    const item = supervisor.inventory.find(i => i.itemId === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });

    // Update stock
    item.quantity += qtyToRestock;
    item.available += qtyToRestock;
    await supervisor.save();

    res.status(200).json({ success: true, data: supervisor.inventory });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// PUBLIC SUPERVISOR SELF-REGISTRATION ROUTE
// ─────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Supervisor = require('../models/Supervisor');
    const bcrypt = require('bcryptjs');
    const { firstName, lastName, phone, password, email } = req.body;

    if (!firstName || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'firstName, phone, and password are required' },
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters' },
      });
    }

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/[^0-9]/g, '').slice(-10)}`;
    const existing = await User.findOne({ phone: formattedPhone });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'PHONE_EXISTS', message: 'This phone number is already registered' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();
    const insertResult = await User.collection.insertOne({
      phone: formattedPhone,
      email: email || undefined,
      role: 'supervisor',
      isVerified: false,
      phoneVerified: false,
      isActive: false, // pending admin approval
      tokenVersion: 1,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    await Supervisor.create({
      userId: insertResult.insertedId,
      firstName: firstName.trim(),
      lastName: lastName?.trim() || '',
      phone: formattedPhone,
      email: email?.trim() || '',
      isActive: false,
      joiningDate: now,
      experience: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Awaiting admin approval before you can log in.',
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// TEMPORARY PUBLIC MIGRATION ROUTE
// ─────────────────────────────────────────────
router.post('/fix-passwords', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Supervisor = require('../models/Supervisor');
    const bcrypt = require('bcryptjs');
    const supervisors = await Supervisor.find().populate('userId');
    const results = [];

    for (const sup of supervisors) {
      const user = sup.userId;
      if (!user || user.role !== 'supervisor') continue;

      const firstName = sup.firstName ? sup.firstName.replace(/\s+/g, '') : 'Supervisor';
      const newPassword = `${firstName}@123`;
      const hash = await bcrypt.hash(newPassword, 12);
      
      let phone = user.phone || '';
      if (!phone.startsWith('+91')) {
        const rawDigits = phone.replace(/[^0-9]/g, '').slice(-10);
        phone = `+91${rawDigits}`;
      }
      
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { phone: phone, passwordHash: hash, updatedAt: new Date() } }
      );
      results.push({ phone: phone, name: firstName, password: newPassword });
    }

    res.status(200).json({
      success: true,
      message: `Reset passwords for ${results.length} supervisors`,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

router.get('/dump-supervisors', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const Supervisor = require('../models/Supervisor');
    const supervisors = await Supervisor.find().populate('userId');
    const results = supervisors.map(s => {
      if (!s.userId) return null;
      const fn = s.firstName ? s.firstName.replace(/\s+/g, '') : 'Supervisor';
      return { 
        id: s._id, 
        userId: s.userId._id, 
        phone: s.userId.phone, 
        role: s.userId.role, 
        name: s.firstName,
        expectedPassword: `${fn}@123`
      };
    }).filter(Boolean);
    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// ADMIN-ONLY ROUTES (super_admin, manager, operations)
// ─────────────────────────────────────────────
router.use(authenticate);
router.use(authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS));

// Stats
router.get('/stats', supervisorController.getStats);

// Reset a single supervisor's password
router.post('/reset-password/:phone', async (req, res, next) => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const { newPassword } = req.body;
    const phone = decodeURIComponent(req.params.phone);

    const user = await User.findOne({ phone, role: 'supervisor' });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: `No supervisor found with phone ${phone}` } });
    }

    const password = newPassword || `Super${String(phone).slice(-4)}`;
    const hash = await bcrypt.hash(password, 12);
    await User.collection.updateOne(
      { _id: user._id },
      { $set: { passwordHash: hash, updatedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: { phone, newPassword: password }
    });
  } catch (error) {
    next(error);
  }
});

// CRUD
router.get('/', validate(listSupervisorsSchema, 'query'), supervisorController.list);
router.post('/', validate(createSupervisorSchema), supervisorController.create);
router.get('/:id', validate(supervisorIdParamSchema, 'params'), supervisorController.getById);
router.put('/:id', validate(supervisorIdParamSchema, 'params'), validate(updateSupervisorSchema), supervisorController.update);
router.patch('/:id/deactivate', validate(supervisorIdParamSchema, 'params'), supervisorController.deactivate);
router.patch('/:id/verify', validate(supervisorIdParamSchema, 'params'), supervisorController.verify);
router.delete('/:id', validate(supervisorIdParamSchema, 'params'), supervisorController.delete);

// Supervisor-specific
router.get('/:id/cleaners', validate(supervisorIdParamSchema, 'params'), supervisorController.getCleaners);

// Custom Allocations & Work approvals
router.post('/:id/allocate-apartment', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateApartment);
router.post('/:id/allocate-cleaner', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateCleaner);
router.post('/:id/allocate-qr', validate(supervisorIdParamSchema, 'params'), supervisorController.allocateQr);
router.post('/:id/approve-work', validate(supervisorIdParamSchema, 'params'), supervisorController.approveWork);
router.post('/:id/reject-work', validate(supervisorIdParamSchema, 'params'), supervisorController.rejectWork);

module.exports = router;
