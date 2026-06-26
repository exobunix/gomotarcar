const Customer = require('../models/Customer');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../middleware/errorHandler');

class CustomerService {
  async getProfile(userId) {
    const customer = await Customer.findOne({ userId })
      .populate('userId', 'phone email isActive lastLogin')
      .populate('defaultAddressId');
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    return customer;
  }

  async updateProfile(userId, updates) {
    const customer = await Customer.findOne({ userId });
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

    const allowed = ['firstName', 'lastName', 'email', 'photo'];
    allowed.forEach(f => { if (updates[f] !== undefined) customer[f] = updates[f]; });
    await customer.save();
    return customer;
  }

  async getMyBookings(userId) {
    const customer = await Customer.findOne({ userId });
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    const ServiceBooking = require('../models/ServiceBooking');
    return ServiceBooking.find({ customerId: customer._id }).sort({ createdAt: -1 });
  }

  async getMyVehicles(userId) {
    const customer = await Customer.findOne({ userId });
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    return Vehicle.find({ customerId: customer._id });
  }

  async addVehicle(userId, data) {
    const customer = await Customer.findOne({ userId });
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    const vehicleService = require('./vehicle.service');
    return vehicleService.create({ ...data, customerId: customer._id });
  }

  async getById(customerId) {
    const customer = await Customer.findById(customerId)
      .populate('userId', 'phone email isActive')
      .populate('defaultAddressId');
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    return customer;
  }

  async list({ page = 1, limit = 20, search, subscriptionStatus, isActive, city, apartmentId } = {}) {
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (subscriptionStatus && subscriptionStatus !== 'All') {
      if (subscriptionStatus === 'active') query.subscriptionStatus = 'active';
      else if (subscriptionStatus === 'inactive') query.subscriptionStatus = { $ne: 'active' };
      else query.subscriptionStatus = subscriptionStatus;
    }
    
    if (isActive && isActive !== 'All Status') {
      const userIds = await User.find({ isActive: isActive === 'active', role: 'customer' }).distinct('_id');
      query.userId = { $in: userIds };
    }

    if (apartmentId && apartmentId !== 'All Apartments') {
      const Subscription = require('../models/Subscription');
      const custIds = await Subscription.find({ apartmentId }).distinct('customerId');
      query._id = { $in: custIds };
    }

    if (city && city !== 'All Cities') {
      const Apartment = require('../models/Apartment');
      const Subscription = require('../models/Subscription');
      const apts = await Apartment.find({ city }).distinct('_id');
      const custIds = await Subscription.find({ apartmentId: { $in: apts } }).distinct('customerId');
      // intersect if _id already set
      if (query._id) {
        const existingIds = query._id.$in.map(id => id.toString());
        query._id = { $in: custIds.filter(id => existingIds.includes(id.toString())) };
      } else {
        query._id = { $in: custIds };
      }
    }

    const skip = (page - 1) * limit;
    const [customersRaw, total] = await Promise.all([
      Customer.find(query)
        .populate('userId', 'phone email isActive')
        .populate({
          path: 'activeSubscriptionId',
          populate: [
            { path: 'apartmentId', select: 'name society city' },
            { path: 'cleanerId', select: 'firstName lastName cleanerId' },
            { path: 'supervisorId', select: 'firstName lastName code' }
          ]
        })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    const enhancedCustomers = await Promise.all(customersRaw.map(async (c) => {
      const vCount = await Vehicle.countDocuments({ customerId: c._id });
      const readableId = `CU-${c._id.toString().substring(19).toUpperCase()}`;
      
      let supName = null;
      let supCode = null;

      if (c.activeSubscriptionId?.supervisorId) {
        const Supervisor = require('../models/Supervisor');
        const supUserId = c.activeSubscriptionId.supervisorId._id || c.activeSubscriptionId.supervisorId;
        const profile = await Supervisor.findOne({ userId: supUserId }).lean();
        if (profile) {
          supName = `${profile.firstName} ${profile.lastName || ''}`.trim();
          supCode = profile.supervisorCode || `SU-${String(profile._id).slice(-3).toUpperCase()}`;
        } else {
          // Fallback if no supervisor profile exists yet
          supName = c.activeSubscriptionId.supervisorId.firstName 
            ? `${c.activeSubscriptionId.supervisorId.firstName} ${c.activeSubscriptionId.supervisorId.lastName || ''}`.trim()
            : 'Suresh Yadav';
          supCode = c.activeSubscriptionId.supervisorId.code || 'SU-215';
        }
      }

      return {
        ...c,
        customerIdDisplay: readableId,
        vehiclesCount: vCount,
        isActive: c.userId?.isActive !== false,
        assignedCleaner: c.activeSubscriptionId?.cleanerId,
        assignedSupervisor: c.activeSubscriptionId ? { name: supName, code: supCode } : null,
        assignedApartment: c.activeSubscriptionId?.apartmentId,
      };
    }));

    return {
      data: enhancedCustomers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async update(customerId, updates) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    const allowed = ['firstName', 'lastName', 'email', 'photo', 'subscriptionStatus', 'totalBookings', 'totalSpent', 'totalCleanings', 'cleaningBalance'];
    let userUpdates = {};
    allowed.forEach(f => { if (updates[f] !== undefined) customer[f] = updates[f]; });
    if (updates.phone) {
      userUpdates.phone = updates.phone;
      customer.phone = updates.phone;
    }
    if (updates.email) {
      userUpdates.email = updates.email;
    }
    if (updates.isActive !== undefined) {
      userUpdates.isActive = updates.isActive === true || updates.isActive === 'true';
    }
    if (Object.keys(userUpdates).length > 0 && customer.userId) {
      await User.findByIdAndUpdate(customer.userId, userUpdates);
    }
    await customer.save();
    await customer.populate(['userId', 'defaultAddressId']);
    return customer;
  }

  async deactivate(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
    await User.findByIdAndUpdate(customer.userId, { isActive: false });
    return { message: 'Customer deactivated' };
  }

  async create(data) {
    const { firstName, lastName, phone, email } = data;
    const existingUser = await User.findOne({ phone });
    if (existingUser) throw new AppError('Phone number already registered', 409, 'CUSTOMER_PHONE_EXISTS');

    const user = await User.create({
      phone,
      email,
      role: 'customer',
      isVerified: true,
      phoneVerified: true,
    });

    const customer = await Customer.create({
      userId: user._id,
      firstName: firstName || 'New',
      lastName: lastName || 'Customer',
      phone,
      email,
    });

    return customer.populate('userId', 'phone email isActive');
  }

  async getStats() {
    const [total, subscribers, newCustomersThisMonth, totalVehicles] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ subscriptionStatus: 'active' }),
      Customer.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
      Vehicle.countDocuments(),
    ]);

    const activeCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const inactiveCustomers = total - activeCustomers;

    return { totalCustomers: total, activeCustomers, inactiveCustomers, subscribers, newCustomersThisMonth, totalVehicles };
  }
}

module.exports = new CustomerService();
