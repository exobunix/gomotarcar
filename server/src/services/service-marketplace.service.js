const ServiceCategory = require('../models/ServiceCategory');
const ServiceProvider = require('../models/ServiceProvider');
const ServiceBooking = require('../models/ServiceBooking');
const { AppError } = require('../middleware/errorHandler');

class MarketplaceService {
  // ─── Categories ───
  async listCategories({ page = 1, limit = 20, isActive } = {}) {
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      ServiceCategory.find(query).sort({ sortOrder: 1 }).skip(skip).limit(limit),
      ServiceCategory.countDocuments(query),
    ]);
    return {
      data: categories,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async createCategory(data) {
    return ServiceCategory.create(data);
  }

  async updateCategory(categoryId, data) {
    const category = await ServiceCategory.findByIdAndUpdate(categoryId, data, { new: true, runValidators: true });
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return category;
  }

  async deleteCategory(categoryId) {
    const category = await ServiceCategory.findByIdAndDelete(categoryId);
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return { message: 'Category deleted' };
  }

  // ─── Providers ───
  async listProviders({ page = 1, limit = 20, isActive, categoryId, search, verified } = {}) {
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (categoryId) query.categories = categoryId;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
      ServiceProvider.find(query).populate('categories', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      ServiceProvider.countDocuments(query),
    ]);
    return {
      data: providers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 },
    };
  }

  async createProvider(data) {
    return ServiceProvider.create(data);
  }

  async updateProvider(providerId, data) {
    const provider = await ServiceProvider.findByIdAndUpdate(providerId, data, { new: true, runValidators: true });
    if (!provider) throw new AppError('Provider not found', 404, 'PROVIDER_NOT_FOUND');
    return provider;
  }

  async deleteProvider(providerId) {
    const provider = await ServiceProvider.findByIdAndDelete(providerId);
    if (!provider) throw new AppError('Provider not found', 404, 'PROVIDER_NOT_FOUND');
    return { message: 'Provider deleted' };
  }

  // ─── Stats ───
  async getStats() {
    const [totalCategories, totalProviders, activeProviders, totalBookings] = await Promise.all([
      ServiceCategory.countDocuments(),
      ServiceProvider.countDocuments(),
      ServiceProvider.countDocuments({ isActive: true }),
      ServiceBooking.countDocuments(),
    ]);
    return { totalCategories, totalProviders, activeProviders, totalBookings };
  }
}

module.exports = new MarketplaceService();
