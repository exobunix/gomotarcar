const Vehicle = require('../models/Vehicle');
const { AppError } = require('../middleware/errorHandler');

class VehicleService {
  /**
   * Register a new vehicle for a customer
   */
  async create(data) {
    const {
      customerId, vehicleNumber, model, make, year, color,
      fuelType, vehicleType, photo,
    } = data;

    // Check duplicate vehicle number
    const existing = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (existing) {
      throw new AppError('Vehicle number already registered', 409, 'VEHICLE_NUMBER_EXISTS');
    }

    const vehicle = await Vehicle.create({
      customerId,
      vehicleNumber: vehicleNumber.toUpperCase(),
      model,
      make,
      year,
      color,
      fuelType,
      vehicleType,
      photo,
    });

    // Auto-generate unique QR code for the new vehicle
    try {
      const qrService = require('./qr.service');
      await qrService.generate({
        vehicleId: vehicle._id,
        customerId: customerId,
      });
    } catch (err) {
      console.error('Failed to auto-generate QR code for new vehicle:', err.message);
    }

    return vehicle;
  }

  /**
   * Get vehicle by ID
   */
  async getById(vehicleId) {
    const vehicle = await Vehicle.findById(vehicleId)
      .populate('customerId', 'firstName lastName phone');
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }
    return vehicle;
  }

  /**
   * Get vehicle by registration number
   */
  async getByVehicleNumber(vehicleNumber) {
    const vehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumber.toUpperCase() })
      .populate('customerId', 'firstName lastName phone');
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }
    return vehicle;
  }

  /**
   * List vehicles for a customer
   */
  async listByCustomer(customerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [vehicles, total] = await Promise.all([
      Vehicle.find({ customerId, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Vehicle.countDocuments({ customerId, isActive: true }),
    ]);

    return {
      data: vehicles,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * List all vehicles (admin)
   */
  async list({ page = 1, limit = 20, isActive, vehicleType, search } = {}) {
    const query = {};
    if (isActive !== undefined) query.isActive = isActive;
    if (vehicleType) query.vehicleType = vehicleType;
    if (search) {
      query.$or = [
        { vehicleNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('customerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Vehicle.countDocuments(query),
    ]);

    return {
      data: vehicles,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update vehicle
   */
  async update(vehicleId, updates) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }

    const allowedFields = [
      'model', 'make', 'year', 'color', 'fuelType',
      'vehicleType', 'photo', 'rcVerified', 'pucExpiry',
      'isActive',
    ];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        vehicle[field] = updates[field];
      }
    });

    if (updates.vehicleNumber) {
      vehicle.vehicleNumber = updates.vehicleNumber.toUpperCase();
    }

    await vehicle.save();
    return vehicle;
  }

  /**
   * Add cleaning history entry
   */
  async addCleaningHistory(vehicleId, entry) {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }

    vehicle.cleaningHistory.push(entry);
    vehicle.totalCleanings = (vehicle.totalCleanings || 0) + 1;
    vehicle.lastCleaning = new Date();
    await vehicle.save();

    return vehicle;
  }

  /**
   * Delete vehicle (soft)
   */
  async deactivate(vehicleId) {
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { isActive: false },
      { new: true }
    );
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }
    return vehicle;
  }

  /**
   * Hard delete vehicle
   */
  async delete(vehicleId) {
    const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
    }
    return { message: 'Vehicle deleted successfully' };
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    const [total, active] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ isActive: true }),
    ]);
    return { totalVehicles: total, activeVehicles: active };
  }
}

module.exports = new VehicleService();
