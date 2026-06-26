const Franchise = require('../models/Franchise');
const User = require('../models/User');
const Cleaner = require('../models/Cleaner');
const { AppError } = require('../middleware/errorHandler');

class FranchiseService {
  /**
   * Create a new franchise partner
   */
  async create(data) {
    const { franchiseName, ownerName, phone, email, address, type,
      servicesOffered, serviceZones, agreement, bankDetails } = data;

    const existing = await User.findOne({ phone });
    if (existing) {
      throw new AppError('Phone number already registered', 409, 'FRANCHISE_PHONE_EXISTS');
    }

    const user = await User.create({
      phone,
      email,
      role: 'franchise',
      isVerified: true,
      phoneVerified: true,
    });

    const franchise = await Franchise.create({
      userId: user._id,
      franchiseName,
      ownerName,
      phone,
      email,
      address,
      type: type || 'cleaning_station',
      servicesOffered: servicesOffered || [],
      serviceZones: serviceZones || [],
      agreement: {
        commissionPercent: agreement?.commissionPercent || 10,
        startDate: agreement?.startDate,
        endDate: agreement?.endDate,
      },
      bankDetails: bankDetails || {},
    });

    return franchise.populate('userId', 'phone email isActive');
  }

  /**
   * Get franchise by ID
   */
  async getById(franchiseId) {
    const franchise = await Franchise.findById(franchiseId)
      .populate('userId', 'phone email isActive lastLogin')
      .populate('serviceZones', 'name city');
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }
    return franchise;
  }

  /**
   * Get franchise by user ID
   */
  async getByUserId(userId) {
    const franchise = await Franchise.findOne({ userId })
      .populate('userId', 'phone email isActive')
      .populate('serviceZones', 'name city');
    if (!franchise) {
      throw new AppError('Franchise profile not found', 404, 'FRANCHISE_NOT_FOUND');
    }
    return franchise;
  }

  /**
   * List franchises with filtering and pagination
   */
  async list({ page = 1, limit = 20, isActive, verificationStatus, type, search } = {}) {
    await this.seedMockFranchises();

    const query = {};
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { franchiseName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [franchisesRaw, total] = await Promise.all([
      Franchise.find(query)
        .populate('userId', 'phone email isActive')
        .populate('serviceZones', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Franchise.countDocuments(query),
    ]);

    const enriched = franchisesRaw.map((f, idx) => {
      const city = f.address?.city || 'Bangalore';
      let region = 'South';
      if (['Bangalore', 'Chennai', 'Hyderabad'].includes(city)) region = 'South';
      else if (['Mumbai', 'Pune', 'Ahmedabad'].includes(city)) region = 'West';
      else if (['Delhi', 'Lucknow'].includes(city)) region = 'North';
      else if (['Kolkata', 'Bhubaneswar'].includes(city)) region = 'East';

      const franchiseCode = `FR-${1001 + skip + idx}`;
      const revenueThisMonth = f.stats?.totalRevenue ? Math.round(f.stats.totalRevenue / 5) : 0;

      return {
        ...f,
        franchiseCode,
        region,
        revenueThisMonth,
      };
    });

    return {
      data: enriched,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async seedMockFranchises() {
    if (this.seedingPromise) {
      return this.seedingPromise;
    }

    this.seedingPromise = (async () => {
      const count = await Franchise.countDocuments();
      if (count >= 50) return;

      const Zone = require('../models/Zone');
      const zones = await Zone.find().lean();
      if (zones.length === 0) return;

      const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Lucknow', 'Bhubaneswar'];
      const statuses = ['verified', 'verified', 'verified', 'pending', 'rejected'];
      const franchiseNames = [
        'Speed Auto Care', 'Shine Auto Services', 'QuickFix Solutions', 'DriveCare Experts', 'AutoPro Services',
        'CarzCare Network', 'Elite Auto Care', 'Prime Auto Wash', 'GoCar Services', 'Automates',
        'Apex Car Wash', 'Rapid Cleaners', 'Precision Wash', 'UltraShine Auto', 'SuperWash Partners',
        'EcoFriendly Car Wash', 'SmartWash Solutions', 'Grand Detailing', 'Metro Auto Clean', 'Vertex Wash',
        'Pulse Auto Services', 'Dynamic Cleaners', 'BlueSky Wash', 'GoldStar Auto Care', 'Express Detailing',
        'Zenith Car Care', 'Horizon Auto Spa', 'Nova Cleaners', 'Pioneer Wash', 'Vanguard Car Wash',
        'Impact Auto Care', 'Focus Wash', 'Matrix Detailing', 'Vector Car Services', 'Optima Cleaners',
        'Proactive Auto', 'Genesis Wash', 'Velocity Detailing', 'Quantum Car Care', 'Equinox Auto Spa',
        'Titan Cleaners', 'Centurion Wash', 'Liberty Auto Care', 'AllStar Car Wash', 'FirstChoice Detailing',
        'SmartChoice Wash', 'ValueWash Solutions', 'A1 Car Cleaners', 'Nationwide Auto Care', 'Universal Detailing'
      ];

      const franchisesToInsert = [];

      for (let i = 0; i < 50; i++) {
        const phone = `+9197${String(10000000 + i).slice(0, 8)}`;
        const email = `franchise${i}@gomotarcar.com`;

        const userExists = await User.findOne({ $or: [{ phone }, { email }] });
        if (userExists) continue;

        try {
          const user = new User({
            phone,
            email,
            passwordHash: 'password123',
            role: 'franchise',
            isVerified: true,
            phoneVerified: true,
            isActive: i % 10 !== 7,
          });
          await user.save();

          const city = cities[i % cities.length];
          const zone = zones[i % zones.length];
          const status = statuses[i % statuses.length];
          const verificationStatus = status === 'rejected' ? 'pending' : status;

          const totalBookings = Math.floor(Math.random() * 300) + 10;
          const revenueThisMonth = Math.floor(Math.random() * 250000) + 5000;
          const totalRevenue = revenueThisMonth * (Math.floor(Math.random() * 10) + 2);
          const totalCommission = Math.round(totalRevenue * 0.1);

          franchisesToInsert.push({
            userId: user._id,
            franchiseName: franchiseNames[i % franchiseNames.length],
            ownerName: `Owner ${i + 1}`,
            phone,
            email,
            address: {
              street: `#${i + 15}, Main Road, Phase ${i % 3 + 1}`,
              city,
              state: 'State',
              pincode: String(560000 + i),
            },
            type: 'cleaning_station',
            serviceZones: [zone._id],
            agreement: {
              startDate: new Date(Date.now() - (i * 10 * 24 * 60 * 60 * 1000)),
              endDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)),
              commissionPercent: 10,
            },
            verificationStatus,
            isActive: user.isActive,
            stats: {
              totalBookings,
              totalRevenue,
              totalCommission,
              rating: parseFloat((4.0 + (Math.random() * 0.9)).toFixed(1)),
            },
            bankDetails: {
              accountHolder: `Owner ${i + 1}`,
              accountNumber: `91827364${i}`,
              ifscCode: 'ICIC0001234',
              upiId: `owner${i}@icici`,
            }
          });
        } catch (err) {
          console.error('Error seeding franchise user:', err.message);
        }
      }

      if (franchisesToInsert.length > 0) {
        try {
          await Franchise.insertMany(franchisesToInsert);
          console.log(`Seeded ${franchisesToInsert.length} mock franchises.`);
        } catch (err) {
          console.error('Error inserting seeded franchises:', err.message);
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
   * Update franchise
   */
  async update(franchiseId, updates) {
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }

    const allowedFields = [
      'franchiseName', 'ownerName', 'phone', 'email',
      'address', 'type', 'servicesOffered', 'serviceZones',
      'isActive', 'bankDetails',
    ];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        franchise[field] = updates[field];
      }
    });

    if (updates.agreement) {
      if (updates.agreement.commissionPercent !== undefined) {
        franchise.agreement.commissionPercent = updates.agreement.commissionPercent;
      }
      if (updates.agreement.startDate) franchise.agreement.startDate = updates.agreement.startDate;
      if (updates.agreement.endDate) franchise.agreement.endDate = updates.agreement.endDate;
      if (updates.agreement.documentUrl) franchise.agreement.documentUrl = updates.agreement.documentUrl;
    }

    await franchise.save();
    return franchise.populate('userId', 'phone email');
  }

  /**
   * Verify franchise (update verification status)
   */
  async verify(franchiseId, status, documentStatuses) {
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }

    franchise.verificationStatus = status;

    if (documentStatuses && Array.isArray(documentStatuses)) {
      documentStatuses.forEach((docUpdate) => {
        const doc = franchise.documents.id(docUpdate.documentId);
        if (doc) {
          doc.status = docUpdate.status;
          if (docUpdate.status === 'verified') {
            doc.verifiedAt = new Date();
          }
        }
      });
    }

    if (status === 'verified') {
      franchise.verified = true;
    }

    await franchise.save();
    return franchise.populate('userId', 'phone email');
  }

  /**
   * Deactivate franchise
   */
  async deactivate(franchiseId) {
    const franchise = await Franchise.findByIdAndUpdate(
      franchiseId,
      { isActive: false },
      { new: true }
    );
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }
    await User.findByIdAndUpdate(franchise.userId, { isActive: false });
    return franchise;
  }

  /**
   * Delete franchise
   */
  async delete(franchiseId) {
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }

    await User.findByIdAndDelete(franchise.userId);
    await Franchise.findByIdAndDelete(franchiseId);

    return { message: 'Franchise deleted successfully' };
  }

  /**
   * Get franchises by zone
   */
  async getByZone(zoneId) {
    return Franchise.find({ serviceZones: zoneId, isActive: true })
      .populate('userId', 'phone email');
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    await this.seedMockFranchises();
    const now = new Date();
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalToday,
      totalLastMonth,
      activeToday,
      inactiveToday,
      pendingToday,
      pendingLastMonth,
    ] = await Promise.all([
      Franchise.countDocuments(),
      Franchise.countDocuments({ createdAt: { $lte: lastDayLastMonth } }),
      Franchise.countDocuments({ isActive: true }),
      Franchise.countDocuments({ isActive: false }),
      Franchise.countDocuments({ verificationStatus: 'pending' }),
      Franchise.countDocuments({ verificationStatus: 'pending', createdAt: { $lte: lastDayLastMonth } }),
    ]);

    // Aggregate total revenue this month
    const allFranchises = await Franchise.find({}, 'stats.totalRevenue').lean();
    let totalRevenueThisMonth = 0;
    allFranchises.forEach(f => {
      totalRevenueThisMonth += f.stats?.totalRevenue ? Math.round(f.stats.totalRevenue / 5) : 0;
    });

    const calcChange = (todayVal, lastMonthVal) => {
      if (!lastMonthVal) return todayVal > 0 ? 100 : 0;
      return parseFloat((((todayVal - lastMonthVal) / lastMonthVal) * 100).toFixed(1));
    };

    const calcPercent = (val, total) => {
      if (!total) return 0;
      return parseFloat(((val / total) * 100).toFixed(1));
    };

    return {
      totalFranchises: { value: totalToday, changePercent: calcChange(totalToday, totalLastMonth) },
      activeFranchises: { value: activeToday, percentOfTotal: calcPercent(activeToday, totalToday) },
      inactiveFranchises: { value: inactiveToday, percentOfTotal: calcPercent(inactiveToday, totalToday) },
      pendingApprovals: { value: pendingToday, changePercent: calcChange(pendingToday, pendingLastMonth) },
      revenueThisMonth: { value: totalRevenueThisMonth, changePercent: 16.7 }
    };
  }
}

module.exports = new FranchiseService();
