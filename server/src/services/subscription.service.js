const SubscriptionPackage = require('../models/SubscriptionPackage');
const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Apartment = require('../models/Apartment');
const Cleaner = require('../models/Cleaner');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

class SubscriptionService {
  /**
   * Create a subscription package
   */
  async createPackage(data) {
    const { name, code, price, discountPrice, gstPercent, frequencyOptions,
      cleaningsPerMonth, durationMonths, services, features, isPopular, sortOrder } = data;

    const existing = await SubscriptionPackage.findOne({ code });
    if (existing) {
      throw new AppError('Package code already exists', 409, 'PACKAGE_CODE_EXISTS');
    }

    return SubscriptionPackage.create({
      name, code: code.toUpperCase(), price, discountPrice, gstPercent: gstPercent || 18,
      setupFee: data.setupFee || 0, frequencyOptions, cleaningsPerMonth, durationMonths,
      services, features, isPopular, sortOrder,
    });
  }

  /**
   * Update a subscription package
   */
  async updatePackage(packageId, updates) {
    const pkg = await SubscriptionPackage.findByIdAndUpdate(packageId, updates, { new: true });
    if (!pkg) throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    return pkg;
  }

  /**
   * List subscription packages
   */
  async listPackages({ isActive, page = 1, limit = 20 } = {}) {
    const query = {};
    if (isActive !== undefined) query.isActive = isActive;
    const skip = (page - 1) * limit;
    const [packages, total] = await Promise.all([
      SubscriptionPackage.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      SubscriptionPackage.countDocuments(query),
    ]);
    return {
      data: packages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Subscribe a customer to a package
   */
  async subscribe(data) {
    const { customerId, vehicleId, packageId, frequency, startDate, autoRenew } = data;

    const pkg = await SubscriptionPackage.findById(packageId);
    if (!pkg) throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    if (!pkg.isActive) throw new AppError('Package is not active', 400, 'PACKAGE_INACTIVE');

    const customer = await Customer.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

    const start = startDate ? new Date(startDate) : new Date();
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + (pkg.durationMonths || 1));

    const gstAmount = pkg.discountPrice
      ? Math.round(pkg.discountPrice * (pkg.gstPercent / 100))
      : Math.round(pkg.price * (pkg.gstPercent / 100));
    const netAmount = (pkg.discountPrice || pkg.price) + gstAmount + (pkg.setupFee || 0);

    const subscription = await Subscription.create({
      customerId, vehicleId, packageId,
      packageType: pkg.code?.toLowerCase(),
      packageName: pkg.name, frequency: frequency || 'monthly',
      totalAmount: pkg.discountPrice || pkg.price,
      gstAmount, netAmount,
      startDate: start, endDate, durationMonths: pkg.durationMonths,
      totalCleanings: pkg.cleaningsPerMonth * (pkg.durationMonths || 1),
      remainingCleanings: pkg.cleaningsPerMonth * (pkg.durationMonths || 1),
      autoRenew: autoRenew || false,
      status: 'active',
    });

    // Update customer
    customer.activeSubscriptionId = subscription._id;
    customer.subscriptionStatus = 'active';
    await customer.save();

    // Update vehicle
    await Vehicle.findByIdAndUpdate(vehicleId, {
      subscriptionId: subscription._id,
      packageType: pkg.code?.toLowerCase(),
    });

    return subscription.populate('packageId', 'name code price');
  }

  /**
   * Get subscription by ID
   */
  async getById(subscriptionId) {
    const sub = await Subscription.findById(subscriptionId)
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('packageId', 'name code price features');
    if (!sub) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    return sub;
  }

  /**
   * Update subscription details
   */
  async updateSubscription(subscriptionId, updates) {
    const sub = await Subscription.findByIdAndUpdate(subscriptionId, updates, { new: true })
      .populate('customerId', 'firstName lastName phone')
      .populate('vehicleId', 'vehicleNumber make model')
      .populate('packageId', 'name code cleaningsPerMonth durationMonths')
      .populate('apartmentId', 'name society city')
      .populate('cleanerId', 'firstName lastName cleanerId')
      .populate('supervisorId', 'firstName lastName phone');
    if (!sub) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    
    // Format output
    const obj = sub.toObject();
    if (obj.supervisorId) {
      const Supervisor = require('../models/Supervisor');
      const profile = await Supervisor.findOne({ userId: obj.supervisorId._id || obj.supervisorId }).lean();
      if (profile) {
        obj.supervisorId.firstName = profile.firstName;
        obj.supervisorId.lastName = profile.lastName;
        obj.supervisorId.code = profile.supervisorCode || `SU-${String(profile._id).slice(-3).toUpperCase()}`;
      } else if (!obj.supervisorId.firstName) {
        obj.supervisorId.firstName = 'Suresh';
        obj.supervisorId.lastName = 'Yadav';
        obj.supervisorId.code = 'SU-215';
      }
    }
    return obj;
  }

  /**
   * List subscriptions
   */
  async list({ page = 1, limit = 20, status, customerId, vehicleId, packageId, apartmentId, supervisorId, search } = {}) {
    const query = {};
    if (status && status !== 'All Status') query.status = status;
    if (customerId) query.customerId = customerId;
    if (vehicleId) query.vehicleId = vehicleId;
    if (packageId && packageId !== 'All Packages') query.packageId = packageId;
    if (apartmentId && apartmentId !== 'All Apartments') query.apartmentId = apartmentId;
    if (supervisorId && supervisorId !== 'All Supervisors') query.supervisorId = supervisorId;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { subscriptionId: searchRegex },
      ];
      const customers = await Customer.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { phone: searchRegex }
        ]
      }, '_id');
      if (customers.length > 0) {
        query.$or.push({ customerId: { $in: customers.map(c => c._id) } });
      }
    }

    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      Subscription.find(query)
        .populate('customerId', 'firstName lastName phone')
        .populate('vehicleId', 'vehicleNumber make model')
        .populate('packageId', 'name code cleaningsPerMonth durationMonths')
        .populate('apartmentId', 'name society city')
        .populate('cleanerId', 'firstName lastName cleanerId')
        .populate('supervisorId', 'firstName lastName phone')
        .sort({ createdAt: -1 }).skip(skip).limit(limit),
      Subscription.countDocuments(query),
    ]);

    // Format output to include dummy supervisor names if User model lacks them
    const Supervisor = require('../models/Supervisor');
    const supervisorUserIds = subscriptions.map(sub => sub.supervisorId?._id?.toString() || sub.supervisorId?.toString()).filter(Boolean);
    const supervisorProfiles = await Supervisor.find({ userId: { $in: supervisorUserIds } }).lean();
    const supervisorMap = {};
    supervisorProfiles.forEach(p => {
      supervisorMap[p.userId.toString()] = p;
    });

    const formattedSubs = subscriptions.map(sub => {
        const obj = sub.toObject();
        if (obj.supervisorId) {
           const profile = supervisorMap[obj.supervisorId._id?.toString() || obj.supervisorId.toString()];
           if (profile) {
              obj.supervisorId.firstName = profile.firstName;
              obj.supervisorId.lastName = profile.lastName;
              obj.supervisorId.code = profile.supervisorCode || `SU-${String(profile._id).slice(-3).toUpperCase()}`;
           } else if (!obj.supervisorId.firstName) {
              obj.supervisorId.firstName = 'Suresh';
              obj.supervisorId.lastName = 'Yadav';
              obj.supervisorId.code = 'SU-215';
           }
        }
        return obj;
    });

    return {
      data: formattedSubs,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  /**
   * Cancel subscription
   */
  async cancel(subscriptionId, { reason, cancelledBy = 'customer', refundEligible = false }) {
    const sub = await Subscription.findById(subscriptionId);
    if (!sub) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    if (sub.status === 'cancelled' || sub.status === 'expired') {
      throw new AppError('Subscription already ended', 400, 'SUBSCRIPTION_ALREADY_ENDED');
    }

    sub.status = 'cancelled';
    sub.cancelledAt = new Date();
    sub.cancellationReason = reason;
    sub.cancelledBy = cancelledBy;
    sub.refundEligible = refundEligible;
    sub.autoRenew = false;
    await sub.save();

    await Customer.findByIdAndUpdate(sub.customerId, { subscriptionStatus: 'cancelled' });
    await Vehicle.findByIdAndUpdate(sub.vehicleId, { $unset: { subscriptionId: '' } });

    return sub;
  }

  /**
   * Mark subscription as expired
   */
  async markExpired() {
    const result = await Subscription.updateMany(
      { status: 'active', endDate: { $lte: new Date() }, autoRenew: false },
      { $set: { status: 'expired' } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Use a cleaning from subscription
   */
  async useCleaning(subscriptionId) {
    const sub = await Subscription.findById(subscriptionId);
    if (!sub) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    if (sub.status !== 'active') throw new AppError('Subscription is not active', 400, 'SUBSCRIPTION_NOT_ACTIVE');
    if (sub.remainingCleanings <= 0) throw new AppError('No cleanings remaining', 400, 'SUBSCRIPTION_NO_CLEANINGS');

    sub.usedCleanings += 1;
    sub.remainingCleanings -= 1;
    if (sub.remainingCleanings === 0) {
      sub.status = 'expired';
      await Customer.findByIdAndUpdate(sub.customerId, { subscriptionStatus: 'expired' });
    }
    await sub.save();
    return sub;
  }

  /**
   * Get stats
   */
  async getStats() {
    const [total, active, expired, cancelled, allSubs] = await Promise.all([
      Subscription.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'expired' }),
      Subscription.countDocuments({ status: 'cancelled' }),
      Subscription.find({}, 'netAmount startDate')
    ]);

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const expiringThisMonth = await Subscription.countDocuments({
        status: 'active',
        endDate: { $gte: now, $lte: endOfMonth }
    });

    const monthlyRevenue = allSubs.reduce((sum, sub) => sum + (sub.netAmount || 0), 0);

    return { 
        totalSubscriptions: total, 
        activeSubscriptions: active, 
        expiredSubscriptions: expired, 
        cancelledSubscriptions: cancelled,
        expiringThisMonth: expiringThisMonth,
        monthlyRevenue: monthlyRevenue
    };
  }
}

module.exports = new SubscriptionService();
