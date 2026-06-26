const NcspPartner = require('../models/NcspPartner');
const { AppError } = require('../middleware/errorHandler');

class NcspService {
  /**
   * Seed mock NCSP partners if collection is empty
   */
  async seedMockPartners() {
    if (this.seedingPromise) {
      return this.seedingPromise;
    }

    this.seedingPromise = (async () => {
      const count = await NcspPartner.countDocuments();
      if (count >= 50) return;

      const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Lucknow', 'Bhubaneswar'];
      const statuses = ['verified', 'verified', 'verified', 'pending', 'rejected'];
      const partnerNames = [
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

      const existingPartners = await NcspPartner.find({}, 'partnerName').lean();
      const existingNames = new Set(existingPartners.map(p => p.partnerName));

      const partnersToInsert = [];
      let idCounter = 1001 + count;

      for (let i = 0; i < 50; i++) {
        const name = partnerNames[i % partnerNames.length];
        if (existingNames.has(name)) continue;

        const city = cities[i % cities.length];
        let region = 'South';
        if (['Bangalore', 'Chennai', 'Hyderabad'].includes(city)) region = 'South';
        else if (['Mumbai', 'Pune', 'Ahmedabad'].includes(city)) region = 'West';
        else if (['Delhi', 'Lucknow'].includes(city)) region = 'North';
        else if (['Kolkata', 'Bhubaneswar'].includes(city)) region = 'East';

        const status = statuses[i % statuses.length];
        const isActive = status !== 'rejected';
        const verificationStatus = status === 'rejected' ? 'pending' : status;

        const totalBookings = Math.floor(Math.random() * 300) + 10;
        const revenueThisMonth = Math.floor(Math.random() * 250000) + 5000;
        const totalRevenue = revenueThisMonth * (Math.floor(Math.random() * 10) + 2);
        const totalPayouts = Math.round(totalRevenue * 0.85);
        const balance = Math.round(revenueThisMonth * 0.1);

        partnersToInsert.push({
          partnerId: `NCSP-${idCounter++}`,
          partnerName: name,
          ownerName: `Owner ${i + 1}`,
          phone: `+9198${String(10000000 + i).slice(0, 8)}`,
          email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
          address: {
            street: `#${i + 10}, Main Road, Phase ${i % 3 + 1}`,
            city,
            state: 'State',
            pincode: String(400000 + i),
            region
          },
          gstin: `29${String(10000 + i)}A1Z${i % 9}`,
          verificationStatus,
          isActive,
          onboardedOn: new Date(Date.now() - (i * 5 * 24 * 60 * 60 * 1000)),
          rating: parseFloat((4.0 + (Math.random() * 0.9)).toFixed(1)),
          ratingCount: Math.floor(Math.random() * 150) + 5,
          stats: {
            totalBookings,
            revenueThisMonth,
            totalRevenue,
            totalPayouts,
            balance
          }
        });
      }

      if (partnersToInsert.length > 0) {
        try {
          await NcspPartner.insertMany(partnersToInsert);
          console.log(`Seeded ${partnersToInsert.length} additional mock partners.`);
        } catch (err) {
          console.error('Error seeding mock partners:', err.message);
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
   * List NCSP partners with filtering, pagination
   */
  async list({ page = 1, limit = 20, status, city, region, search } = {}) {
    await this.seedMockPartners(); // Auto-seed if empty

    const query = {};
    if (status) {
      if (status === 'active') {
        query.isActive = true;
        query.verificationStatus = 'verified';
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'pending') {
        query.verificationStatus = 'pending';
      }
    }
    if (city) query['address.city'] = city;
    if (region) query['address.region'] = region;

    if (search) {
      query.$or = [
        { partnerId: { $regex: search, $options: 'i' } },
        { partnerName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [partners, total] = await Promise.all([
      NcspPartner.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NcspPartner.countDocuments(query),
    ]);

    return {
      data: partners,
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

  /**
   * Get NCSP partner by ID
   */
  async getById(id) {
    const partner = await NcspPartner.findById(id);
    if (!partner) {
      throw new AppError('NCSP Partner not found', 404, 'NCSP_PARTNER_NOT_FOUND');
    }
    return partner;
  }

  /**
   * Create a new NCSP Partner
   */
  async create(data) {
    const count = await NcspPartner.countDocuments();
    const nextIdNum = 1001 + count;
    const partnerId = `NCSP-${nextIdNum}`;

    const newPartner = new NcspPartner({
      partnerId,
      partnerName: data.partnerName,
      ownerName: data.ownerName,
      phone: data.phone,
      email: data.email,
      logo: data.logo,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        region: data.region,
      },
      gstin: data.gstin,
      verificationStatus: 'pending',
      isActive: true,
    });

    await newPartner.save();
    return newPartner;
  }

  /**
   * Update an NCSP Partner
   */
  async update(id, updates) {
    const partner = await NcspPartner.findById(id);
    if (!partner) {
      throw new AppError('NCSP Partner not found', 404, 'NCSP_PARTNER_NOT_FOUND');
    }

    const allowedFields = ['partnerName', 'ownerName', 'phone', 'email', 'logo', 'gstin', 'isActive', 'verificationStatus'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        partner[field] = updates[field];
      }
    });

    if (updates.street || updates.city || updates.state || updates.pincode || updates.region) {
      partner.address = {
        street: updates.street !== undefined ? updates.street : partner.address.street,
        city: updates.city !== undefined ? updates.city : partner.address.city,
        state: updates.state !== undefined ? updates.state : partner.address.state,
        pincode: updates.pincode !== undefined ? updates.pincode : partner.address.pincode,
        region: updates.region !== undefined ? updates.region : partner.address.region,
      };
    }

    await partner.save();
    return partner;
  }

  /**
   * Deactivate partner
   */
  async deactivate(id) {
    const partner = await NcspPartner.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!partner) {
      throw new AppError('NCSP Partner not found', 404, 'NCSP_PARTNER_NOT_FOUND');
    }
    return partner;
  }

  /**
   * Verify (activate) partner
   */
  async verify(id) {
    const partner = await NcspPartner.findByIdAndUpdate(
      id,
      { verificationStatus: 'verified', isActive: true },
      { new: true }
    );
    if (!partner) {
      throw new AppError('NCSP Partner not found', 404, 'NCSP_PARTNER_NOT_FOUND');
    }
    return partner;
  }

  /**
   * Delete partner
   */
  async delete(id) {
    const partner = await NcspPartner.findByIdAndDelete(id);
    if (!partner) {
      throw new AppError('NCSP Partner not found', 404, 'NCSP_PARTNER_NOT_FOUND');
    }
    return { message: 'NCSP Partner deleted successfully' };
  }

  /**
   * Get NCSP dashboard metrics (5 KPIs)
   */
  async getDashboardStats() {
    await this.seedMockPartners(); // Auto-seed if empty

    const [
      totalVal,
      activeVal,
      pendingVal,
      inactiveVal,
      revenueResult
    ] = await Promise.all([
      NcspPartner.countDocuments(),
      NcspPartner.countDocuments({ isActive: true, verificationStatus: 'verified' }),
      NcspPartner.countDocuments({ verificationStatus: 'pending' }),
      NcspPartner.countDocuments({ isActive: false }),
      NcspPartner.aggregate([
        { $group: { _id: null, total: { $sum: '$stats.revenueThisMonth' } } }
      ])
    ]);

    const totalRevenueThisMonth = revenueResult[0]?.total || 1245680;

    return {
      totalPartners: { value: totalVal, changePercent: 7.7 },
      activePartners: { value: activeVal, percentOfTotal: parseFloat(((activeVal / totalVal) * 100).toFixed(1)) },
      pendingApprovals: { value: pendingVal, percentOfTotal: parseFloat(((pendingVal / totalVal) * 100).toFixed(1)) },
      inactivePartners: { value: inactiveVal, percentOfTotal: parseFloat(((inactiveVal / totalVal) * 100).toFixed(1)) },
      revenueThisMonth: { value: totalRevenueThisMonth, changePercent: 15.4 },
    };
  }
}

module.exports = new NcspService();
