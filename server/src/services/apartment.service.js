const Apartment = require('../models/Apartment');
const { AppError } = require('../middleware/errorHandler');

class ApartmentService {
  /**
   * Create a new apartment/address for a customer
   */
  async create(data) {
    const { customerId, name, tower, flatNumber, society,
      street, area, city, state, pincode, coordinates, label } = data;

    const apartment = await Apartment.create({
      customerId,
      name,
      tower,
      flatNumber,
      society,
      street,
      area,
      city,
      state,
      pincode,
      coordinates,
      label: label || 'Apartment',
    });

    // If this is the first address, make it default
    const count = await Apartment.countDocuments({ customerId });
    if (count === 1) {
      apartment.isDefault = true;
      await apartment.save();
    }

    return apartment;
  }

  /**
   * Get apartment by ID
   */
  async getById(apartmentId) {
    const apartment = await Apartment.findById(apartmentId)
      .populate('customerId', 'firstName lastName phone');
    if (!apartment) {
      throw new AppError('Apartment not found', 404, 'APARTMENT_NOT_FOUND');
    }
    return apartment;
  }

  /**
   * List apartments for a customer
   */
  async listByCustomer(customerId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [apartments, total] = await Promise.all([
      Apartment.find({ customerId, isActive: true })
        .sort({ isDefault: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Apartment.countDocuments({ customerId, isActive: true }),
    ]);

    return {
      data: apartments,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * List all apartments (admin)
   */
  async list({ page = 1, limit = 20, city, search } = {}) {
    const query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { society: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { flatNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [apartments, total] = await Promise.all([
      Apartment.find(query)
        .populate('customerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Apartment.countDocuments(query),
    ]);

    return {
      data: apartments,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update apartment
   */
  async update(apartmentId, updates) {
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      throw new AppError('Apartment not found', 404, 'APARTMENT_NOT_FOUND');
    }

    const allowedFields = [
      'name', 'tower', 'flatNumber', 'society', 'street',
      'area', 'city', 'state', 'pincode', 'coordinates',
      'label', 'isDefault',
    ];
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        apartment[field] = updates[field];
      }
    });

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await Apartment.updateMany(
        { customerId: apartment.customerId, _id: { $ne: apartmentId } },
        { isDefault: false }
      );
    }

    await apartment.save();
    return apartment;
  }

  /**
   * Set as default apartment
   */
  async setDefault(apartmentId) {
    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      throw new AppError('Apartment not found', 404, 'APARTMENT_NOT_FOUND');
    }

    // Unset all other defaults for this customer
    await Apartment.updateMany(
      { customerId: apartment.customerId, _id: { $ne: apartmentId } },
      { isDefault: false }
    );

    apartment.isDefault = true;
    await apartment.save();

    return apartment;
  }

  /**
   * Delete apartment
   */
  async delete(apartmentId) {
    const apartment = await Apartment.findByIdAndDelete(apartmentId);
    if (!apartment) {
      throw new AppError('Apartment not found', 404, 'APARTMENT_NOT_FOUND');
    }
    return { message: 'Apartment deleted successfully' };
  }

  /**
   * Get apartments by city
   */
  async getByCity(city) {
    return Apartment.find({ city: new RegExp(city, 'i'), isActive: true })
      .populate('customerId', 'firstName lastName phone')
      .limit(50);
  }
}

module.exports = new ApartmentService();
