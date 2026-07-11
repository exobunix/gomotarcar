const Offer = require('../models/Offer');
const { AppError } = require('../middleware/errorHandler');

class OfferService {
  async list({ page = 1, limit = 20, isActive, type } = {}) {
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const [offers, total] = await Promise.all([
      Offer.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Offer.countDocuments(query),
    ]);

    return {
      data: offers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data) {
    return Offer.create(data);
  }

  async update(id, data) {
    const offer = await Offer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!offer) throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND');
    return offer;
  }

  async delete(id) {
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) throw new AppError('Offer not found', 404, 'OFFER_NOT_FOUND');
    return { message: 'Offer deleted successfully' };
  }
}

module.exports = new OfferService();
