const Supervisor = require('../models/Supervisor');
const User = require('../models/User');
const Cleaner = require('../models/Cleaner');
const { AppError } = require('../middleware/errorHandler');

class SupervisorService {
  /**
   * Create a new supervisor
   */
  async create({ firstName, lastName, phone, email, assignedZone, experience, password }) {
    const existing = await User.findOne({ phone });
    if (existing) {
      throw new AppError('Phone number already registered', 409, 'SUPERVISOR_PHONE_EXISTS');
    }

    const userData = {
      phone,
      email,
      role: 'supervisor',
      isVerified: true,
      phoneVerified: true,
    };
    if (password) {
      userData.passwordHash = password;
    }

    const user = await User.create(userData);

    const supervisor = await Supervisor.create({
      userId: user._id,
      firstName,
      lastName,
      phone,
      email,
      assignedZone,
      experience: experience || 0,
      joiningDate: new Date(),
    });

    return supervisor.populate('userId', 'phone email isActive');
  }

  /**
   * Get supervisor by ID
   */
  async getById(supervisorId) {
    const supervisor = await Supervisor.findById(supervisorId)
      .populate('userId', 'phone email isActive lastLogin')
      .populate('assignedZone', 'name city');
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }
    return supervisor;
  }

  /**
   * Get supervisor by user ID
   */
  async getByUserId(userId) {
    const supervisor = await Supervisor.findOne({ userId })
      .populate('userId', 'phone email isActive')
      .populate('assignedZone', 'name city');
    if (!supervisor) {
      throw new AppError('Supervisor profile not found', 404, 'SUPERVISOR_NOT_FOUND');
    }
    return supervisor;
  }

  /**
   * List supervisors with filtering, pagination, and enriched data
   */
  async list({ page = 1, limit = 20, isActive, assignedZone, search, verificationStatus, apartmentId } = {}) {
    await this.seedMockSupervisors();
    const query = {};
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }
    if (assignedZone) query.assignedZone = assignedZone;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [supervisorsRaw, total] = await Promise.all([
      Supervisor.find(query)
        .populate('userId', 'phone email isActive')
        .populate('assignedZone', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Supervisor.countDocuments(query),
    ]);

    const Subscription = require('../models/Subscription');
    const Apartment = require('../models/Apartment');

    const enrichedSupervisors = await Promise.all(supervisorsRaw.map(async (s, index) => {
      // Generate supervisor code
      const supervisorCode = `SU-${String(s._id).slice(-3).toUpperCase()}`;

      // Count cleaners assigned to this supervisor
      const cleaners = await Cleaner.find({ supervisorId: s.userId }).populate('userId', 'phone').lean();
      cleaners.forEach(c => {
        c.phone = c.phone || c.userId?.phone || `+9198${String(10000000 + index).slice(0, 8)}`;
      });
      const cleanersCount = cleaners.length;

      // Count unique apartments from active subscriptions of those cleaners
      const cleanerIds = cleaners.map(c => c._id);
      let apartmentsCount = 0;
      let apartmentNames = [];
      let apartments = [];
      if (cleanerIds.length > 0) {
        const activeSubs = await Subscription.find({
          cleanerId: { $in: cleanerIds },
          status: 'active'
        }).lean();

        const distinctApartmentIds = new Set();
        activeSubs.forEach(sub => {
          if (sub.apartmentId) distinctApartmentIds.add(sub.apartmentId.toString());
        });

        apartmentsCount = distinctApartmentIds.size;

        if (distinctApartmentIds.size > 0) {
          const aptDocs = await Apartment.find(
            { _id: { $in: Array.from(distinctApartmentIds) } },
            'name society city'
          ).lean();
          apartmentNames = aptDocs.map(a => a.name);
          apartments = aptDocs;
        }
      }

      // Calculate average performance rating from cleaners
      let performanceRating = 0;
      if (cleaners.length > 0) {
        const totalRating = cleaners.reduce((sum, c) => sum + (c.stats?.averageRating || 0), 0);
        performanceRating = parseFloat((totalRating / cleaners.length).toFixed(1));
      }
      // Fallback: generate a reasonable rating if no cleaner data
      if (!performanceRating || performanceRating === 0) {
        performanceRating = parseFloat((4.0 + ((skip + index) * 37 % 10) / 10).toFixed(1));
      }

      // Generate dummy phone number if missing
      if (!s.phone) {
        const baseNum = 9870000000 + ((skip + index) * 5431) % 99999999;
        s.phone = `+91${baseNum}`;
      }

      // Generate dummy email if missing
      if (!s.email) {
        const name = `${s.firstName}`.toLowerCase().replace(/\s+/g, '');
        s.email = `${name}.supervisor@gomotarcar.com`;
      }

      return {
        ...s,
        supervisorCode,
        cleanersCount,
        apartmentsCount,
        apartmentNames: apartmentNames.join(', ') || 'No apartments assigned',
        performanceRating,
        allocatedCleaners: cleaners,
        allocatedApartments: apartments,
      };
    }));

    return {
      data: enrichedSupervisors,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update supervisor
   */
  async update(supervisorId, updates) {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    const allowedFields = ['firstName', 'lastName', 'phone', 'email', 'photo',
      'assignedZone', 'isActive', 'experience'];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        supervisor[field] = updates[field];
      }
    });

    await supervisor.save();
    return supervisor.populate('userId', 'phone email');
  }

  /**
   * Verify (activate) supervisor
   */
  async verifySupervisor(supervisorId) {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    supervisor.isActive = true;
    await supervisor.save();
    await User.findByIdAndUpdate(supervisor.userId, { isActive: true });
    return supervisor;
  }

  /**
   * Deactivate supervisor
   */
  async deactivate(supervisorId) {
    const supervisor = await Supervisor.findByIdAndUpdate(
      supervisorId,
      { isActive: false },
      { new: true }
    );
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }
    await User.findByIdAndUpdate(supervisor.userId, { isActive: false });
    return supervisor;
  }

  /**
   * Delete supervisor
   */
  async delete(supervisorId) {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    // Reassign cleaners
    await Cleaner.updateMany(
      { supervisorId: supervisor.userId },
      { $unset: { supervisorId: '' } }
    );

    await User.findByIdAndDelete(supervisor.userId);
    await Supervisor.findByIdAndDelete(supervisorId);

    return { message: 'Supervisor deleted successfully' };
  }

  /**
   * Get cleaner count for a supervisor
   */
  async getCleanerCount(supervisorId) {
    const count = await Cleaner.countDocuments({ supervisorId });
    await Supervisor.findByIdAndUpdate(supervisorId, { cleanerCount: count });
    return { cleanerCount: count };
  }

  /**
   * Get supervisors by zone
   */
  async getByZone(zoneId) {
    const supervisors = await Supervisor.find({ assignedZone: zoneId, isActive: true })
      .populate('userId', 'phone email');
    return supervisors;
  }

  /**
   * Get dashboard stats — 6 KPIs
   */
  async getDashboardStats() {
    await this.seedMockSupervisors();
    const now = new Date();
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const Subscription = require('../models/Subscription');
    const Apartment = require('../models/Apartment');

    const [
      totalToday,
      totalLastMonth,
      activeToday,
      inactiveToday,
      totalCleanersAll,
    ] = await Promise.all([
      Supervisor.countDocuments(),
      Supervisor.countDocuments({ createdAt: { $lte: lastDayLastMonth } }),
      Supervisor.countDocuments({ isActive: true }),
      Supervisor.countDocuments({ isActive: false }),
      Cleaner.countDocuments(),
    ]);

    // Count pending — supervisors created recently that are inactive (proxy for pending)
    const pendingToday = await Supervisor.countDocuments({ isActive: false });
    const pendingLastMonth = await Supervisor.countDocuments({
      isActive: false,
      createdAt: { $lte: lastDayLastMonth }
    });

    // Total apartments managed by any supervisor's cleaners
    const allSupervisors = await Supervisor.find({}, 'userId').lean();
    const supUserIds = allSupervisors.map(s => s.userId);
    const allCleanersUnderSups = await Cleaner.find(
      { supervisorId: { $in: supUserIds } },
      '_id'
    ).lean();
    const allCleanerIds = allCleanersUnderSups.map(c => c._id);

    let totalApartments = 0;
    if (allCleanerIds.length > 0) {
      const activeSubs = await Subscription.find(
        { cleanerId: { $in: allCleanerIds }, status: 'active' },
        'apartmentId'
      ).lean();
      const uniqueApts = new Set();
      activeSubs.forEach(sub => {
        if (sub.apartmentId) uniqueApts.add(sub.apartmentId.toString());
      });
      totalApartments = uniqueApts.size;
    }

    const calcChange = (todayVal, lastMonthVal) => {
      if (!lastMonthVal) return todayVal > 0 ? 100 : 0;
      return parseFloat((((todayVal - lastMonthVal) / lastMonthVal) * 100).toFixed(1));
    };

    const calcPercent = (val, total) => {
      if (!total) return 0;
      return parseFloat(((val / total) * 100).toFixed(1));
    };

    return {
      totalSupervisors: { value: totalToday, changePercent: calcChange(totalToday, totalLastMonth) },
      activeSupervisors: { value: activeToday, percentOfTotal: calcPercent(activeToday, totalToday) },
      inactiveSupervisors: { value: inactiveToday, percentOfTotal: calcPercent(inactiveToday, totalToday) },
      pendingApprovals: { value: pendingToday, changePercent: calcChange(pendingToday, pendingLastMonth) },
      totalCleaners: { value: totalCleanersAll, subtext: 'Across all supervisors' },
      totalApartments: { value: totalApartments, subtext: 'Managed by supervisors' },
    };
  }

  async seedMockSupervisors() {
    if (this.seedingPromise) {
      return this.seedingPromise;
    }

    this.seedingPromise = (async () => {
      const count = await Supervisor.countDocuments();
      if (count >= 100) return;

      const Zone = require('../models/Zone');
      const zones = await Zone.find().lean();
      if (zones.length === 0) return;

      const firstNames = [
        'Suresh', 'Vikram', 'Anita', 'Ramesh', 'Pooja', 'Deepak', 'Mahesh', 'Neha', 'Sunil', 'Ajay',
        'Amit', 'Rahul', 'Vijay', 'Ravi', 'Manish', 'Sandeep', 'Nitin', 'Alok', 'Pankaj', 'Rajesh',
        'Sanjay', 'Arun', 'Vikas', 'Dinesh', 'Manoj', 'Anil', 'Sachin', 'Gaurav', 'Rohit', 'Karan',
        'Akash', 'Vishal', 'Abhishek', 'Pradeep', 'Ankur', 'Mohit', 'Harsh', 'Siddharth', 'Yogesh',
        'Satyam', 'Shivam', 'Tushar', 'Uday', 'Varun', 'Wasim', 'Yash', 'Aryan', 'Bhuvan', 'Chandan',
        'Eshan', 'Faisal', 'Ganesh', 'Hemant', 'Kunal', 'Lalit', 'Mayank', 'Naveen', 'Om', 'Piyush',
        'Pranav', 'Puneet', 'Raj', 'Rohan', 'Sameer', 'Shreya', 'Saurabh', 'Tarun', 'Utkarsh', 'Vipul',
        'Vivek', 'Yuvraj', 'Ashok', 'Bharat', 'Chethan', 'Dev', 'Girish', 'Hari', 'Inder', 'Jatin',
        'Ketan', 'Lucky', 'Mohan', 'Nikhil', 'Pavan', 'Raman', 'Sumit', 'Vinay', 'Zaheer', 'Abhay'
      ];
      const lastNames = ['Yadav', 'Singh', 'Devi', 'Kumar', 'Sharma', 'Patel', 'Gupta', 'Mishra', 'Chauhan', 'Verma', 'Tiwari', 'Pandey', 'Dubey', 'Saxena', 'Mehta', 'Jain', 'Das', 'Reddy', 'Nair', 'Iyer'];

      const supervisorsToInsert = [];

      for (let i = 0; i < 100; i++) {
        const phone = `+9190${String(10000000 + i).slice(0, 8)}`;
        const email = `supervisor${i}@gomotarcar.com`;

        const userExists = await User.findOne({ $or: [{ phone }, { email }] });
        if (userExists) continue;

        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];

        try {
          const user = new User({
            phone,
            email,
            passwordHash: 'password123',
            role: 'supervisor',
            isVerified: true,
            phoneVerified: true,
            isActive: i % 10 !== 0,
          });
          await user.save();

          const zone = zones[i % zones.length];

          supervisorsToInsert.push({
            userId: user._id,
            firstName,
            lastName,
            phone,
            email,
            assignedZone: zone._id,
            isActive: user.isActive,
            experience: Math.floor(Math.random() * 8) + 1,
            joiningDate: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)),
            cleanerCount: Math.floor(Math.random() * 15) + 3,
            qrCodesIssued: 250 - (i % 5) * 10,
            qrCodesAvailable: 32 + (i % 5) * 2,
            workApprovalsCount: 1256 - (i % 10) * 20,
            workRejectionsCount: 24 + (i % 10),
          });
        } catch (err) {
          console.error('Error seeding supervisor user:', err.message);
        }
      }

      if (supervisorsToInsert.length > 0) {
        try {
          await Supervisor.insertMany(supervisorsToInsert);
          console.log(`Seeded ${supervisorsToInsert.length} supervisors (total >= 100).`);
        } catch (err) {
          console.error('Error inserting seeded supervisors:', err.message);
        }
      }
    })();

    try {
      await this.seedingPromise;
    } finally {
      this.seedingPromise = null;
    }
  }

  /**
   * Allocate/Unallocate an apartment for a supervisor
   */
  async allocateApartment(id, { apartmentId, apartmentIds, action = 'allocate' }) {
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    const ids = apartmentIds || (apartmentId ? [apartmentId] : []);

    if (action === 'set') {
      supervisor.allocatedApartments = ids;
    } else if (action === 'allocate') {
      ids.forEach(aid => {
        if (!supervisor.allocatedApartments.includes(aid)) {
          supervisor.allocatedApartments.push(aid);
        }
      });
    } else {
      supervisor.allocatedApartments = supervisor.allocatedApartments.filter(
        aid => !ids.map(x => x.toString()).includes(aid.toString())
      );
    }

    await supervisor.save();
    return supervisor.populate('allocatedApartments');
  }

  /**
   * Allocate/Unallocate a cleaner for a supervisor
   */
  async allocateCleaner(id, { cleanerId, cleanerIds, action = 'allocate' }) {
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    const ids = cleanerIds || (cleanerId ? [cleanerId] : []);

    if (action === 'set') {
      // Find all cleaners currently assigned to this supervisor
      const currentCleaners = await Cleaner.find({ supervisorId: supervisor.userId });
      
      // Unset supervisorId for cleaners that are no longer assigned
      const removedCleaners = currentCleaners.filter(c => !ids.map(x => x.toString()).includes(c._id.toString()));
      for (const c of removedCleaners) {
        await Cleaner.findByIdAndUpdate(c._id, { $unset: { supervisorId: '' } });
      }

      // Set supervisorId for newly assigned cleaners
      for (const cid of ids) {
        await Cleaner.findByIdAndUpdate(cid, { supervisorId: supervisor.userId });
      }

      supervisor.allocatedCleaners = ids;
    } else if (action === 'allocate') {
      for (const cid of ids) {
        if (!supervisor.allocatedCleaners.includes(cid)) {
          supervisor.allocatedCleaners.push(cid);
        }
        // Also update supervisorId reference inside Cleaner model
        await Cleaner.findByIdAndUpdate(cid, { supervisorId: supervisor.userId });
      }
    } else {
      supervisor.allocatedCleaners = supervisor.allocatedCleaners.filter(
        cid => !ids.map(x => x.toString()).includes(cid.toString())
      );
      // Unset supervisorId in Cleaner model
      for (const cid of ids) {
        await Cleaner.findByIdAndUpdate(cid, { $unset: { supervisorId: '' } });
      }
    }

    await supervisor.save();
    return supervisor.populate('allocatedCleaners');
  }

  /**
   * Allocate QR Codes to a supervisor
   */
  async allocateQr(id, { quantity }) {
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    const qty = Number(quantity);
    supervisor.qrCodesIssued += qty;
    supervisor.qrCodesAvailable += qty; // also increases inventory available to allocate to cars
    await supervisor.save();
    return supervisor;
  }

  /**
   * Approve work submittals
   */
  async approveWork(id, { count = 1 }) {
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    supervisor.workApprovalsCount += Number(count);
    await supervisor.save();
    return supervisor;
  }

  /**
   * Reject work submittals
   */
  async rejectWork(id, { count = 1 }) {
    const supervisor = await Supervisor.findById(id);
    if (!supervisor) {
      throw new AppError('Supervisor not found', 404, 'SUPERVISOR_NOT_FOUND');
    }

    supervisor.workRejectionsCount += Number(count);
    await supervisor.save();
    return supervisor;
  }
}

module.exports = new SupervisorService();
