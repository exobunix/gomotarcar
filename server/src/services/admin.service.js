const Admin = require('../models/Admin');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const { generateId } = require('../utils/helpers');

class AdminService {
  /**
   * Create a new admin user with profile
   */
  async create({ firstName, lastName, email, phone, role, permissions }) {
    // Check existing user by phone
    const existing = await User.findOne({ phone });
    if (existing) {
      throw new AppError('Phone number already registered', 409, 'ADMIN_PHONE_EXISTS');
    }

    // Create User record
    const user = await User.create({
      phone,
      email,
      role: role || 'operations',
      isVerified: true,
      phoneVerified: true,
    });

    // Create Admin profile
    const admin = await Admin.create({
      userId: user._id,
      firstName,
      lastName,
      email,
      phone,
      role: role || 'operations',
      permissions: permissions || [],
    });

    return admin.populate('userId', 'phone email isActive');
  }

  /**
   * Get admin by ID
   */
  async getById(adminId) {
    const admin = await Admin.findById(adminId)
      .populate('userId', 'phone email isActive lastLogin');
    if (!admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }
    return admin;
  }

  /**
   * Get admin by user ID
   */
  async getByUserId(userId) {
    const admin = await Admin.findOne({ userId })
      .populate('userId', 'phone email isActive lastLogin');
    if (!admin) {
      throw new AppError('Admin profile not found', 404, 'ADMIN_NOT_FOUND');
    }
    return admin;
  }

  /**
   * List all admins with filtering and pagination
   */
  async list({ page = 1, limit = 20, role, isActive, search } = {}) {
    await this.seedMockAdmins();
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [admins, total] = await Promise.all([
      Admin.find(query)
        .populate('userId', 'phone email isActive lastLogin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Admin.countDocuments(query),
    ]);

    return {
      data: admins,
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

  async seedMockAdmins() {
    if (this.seedingPromise) {
      return this.seedingPromise;
    }

    this.seedingPromise = (async () => {
      const count = await Admin.countDocuments();
      if (count >= 15) return;

      const firstNames = ['Anshul', 'Rohan', 'Sneha', 'Vikram', 'Priya', 'Kunal', 'Aditi', 'Rahul', 'Nisha', 'Saurabh', 'Neha', 'Gaurav', 'Shreya', 'Manish', 'Karan'];
      const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Mehta', 'Joshi', 'Patel', 'Yadav', 'Tiwari', 'Chauhan', 'Mishra', 'Pandey', 'Dubey', 'Saxena', 'Jain'];
      const roles = ['operations', 'operations', 'manager', 'operations', 'operations', 'manager', 'operations', 'super_admin', 'operations', 'operations', 'manager', 'operations', 'operations', 'operations', 'manager'];
      
      const permissionsList = [
        ['cleaners_manage', 'customers_manage', 'tasks_manage'],
        ['payments_manage', 'support_manage', 'zones_manage'],
        ['cleaners_manage', 'customers_manage', 'tasks_manage', 'payments_manage', 'zones_manage', 'analytics_view'],
        ['support_manage', 'training_manage', 'settings_manage'],
        ['cleaners_manage', 'tasks_manage', 'zones_manage'],
        ['cleaners_manage', 'customers_manage', 'tasks_manage', 'payments_manage', 'zones_manage', 'analytics_view', 'settings_manage'],
        ['support_manage', 'analytics_view'],
        ['cleaners_manage', 'customers_manage', 'tasks_manage', 'payments_manage', 'training_manage', 'zones_manage', 'analytics_view', 'settings_manage', 'support_manage']
      ];

      const adminsToInsert = [];

      for (let i = 0; i < firstNames.length; i++) {
        const phone = `+9198${String(20000000 + i).slice(0, 8)}`;
        const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@gomotarcar.com`;

        const userExists = await User.findOne({ $or: [{ phone }, { email }] });
        if (userExists) continue;

        try {
          const user = new User({
            phone,
            email,
            passwordHash: 'password123',
            role: roles[i % roles.length],
            isVerified: true,
            phoneVerified: true,
            isActive: i % 10 !== 8,
          });
          await user.save();

          adminsToInsert.push({
            userId: user._id,
            firstName: `${firstNames[i]}`,
            lastName: `${lastNames[i]}`,
            email,
            phone,
            role: user.role,
            permissions: permissionsList[i % permissionsList.length],
            isActive: user.isActive,
          });
        } catch (err) {
          console.error('Error seeding admin user:', err.message);
        }
      }

      if (adminsToInsert.length > 0) {
        try {
          await Admin.insertMany(adminsToInsert);
          console.log(`Seeded ${adminsToInsert.length} mock admin/operations users.`);
        } catch (err) {
          console.error('Error inserting seeded admins:', err.message);
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
   * Update admin profile
   */
  async update(adminId, updates) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'permissions', 'isActive'];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        admin[field] = updates[field];
      }
    });

    await admin.save();

    // Also update User email and role if provided
    const userUpdates = {};
    if (updates.email) userUpdates.email = updates.email;
    if (updates.role) userUpdates.role = updates.role;
    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(admin.userId, userUpdates);
    }

    return admin.populate('userId', 'phone email isActive');
  }

  /**
   * Deactivate admin
   */
  async deactivate(adminId) {
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { isActive: false },
      { new: true }
    );
    if (!admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    // Also deactivate user
    await User.findByIdAndUpdate(admin.userId, { isActive: false });

    return admin;
  }

  /**
   * Delete admin (hard delete user + admin profile)
   */
  async delete(adminId) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    await User.findByIdAndDelete(admin.userId);
    await Admin.findByIdAndDelete(adminId);

    return { message: 'Admin deleted successfully' };
  }

  /**
   * Update admin permissions
   */
  async updatePermissions(adminId, permissions) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError('Admin not found', 404, 'ADMIN_NOT_FOUND');
    }

    admin.permissions = permissions;
    await admin.save();

    return admin.populate('userId', 'phone email');
  }

  /**
   * Get dashboard stats for super admin
   */
  async getDashboardStats() {
    await this.seedMockAdmins();
    const [
      totalAdmins,
      activeAdmins,
      operationsCount,
      managersCount,
    ] = await Promise.all([
      Admin.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      Admin.countDocuments({ role: 'operations' }),
      Admin.countDocuments({ role: 'manager' }),
    ]);

    return {
      totalAdmins,
      activeAdmins,
      inactiveAdmins: totalAdmins - activeAdmins,
      operationsCount,
      managersCount,
    };
  }
}

module.exports = new AdminService();
