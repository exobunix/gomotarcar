const ServiceProvider = require('../models/ServiceProvider');
const ServiceCategory = require('../models/ServiceCategory');
const FAQ = require('../models/FAQ');
const Franchise = require('../models/Franchise');

class SearchService {
  /**
   * Full-text search across multiple entities
   */
  async search({ q, type = 'all', page = 1, limit = 10 } = {}) {
    const query = { $regex: q, $options: 'i' };
    const skip = (page - 1) * limit;

    let results = {};

    if (type === 'all' || type === 'services') {
      const [services, servicesTotal] = await Promise.all([
        ServiceCategory.find({
          $or: [
            { name: query },
            { description: query },
            { tags: { $in: [new RegExp(q, 'i')] } },
          ],
          isActive: true,
        }).select('name description icon price duration').skip(skip).limit(limit),
        ServiceCategory.countDocuments({
          $or: [
            { name: query },
            { description: query },
            { tags: { $in: [new RegExp(q, 'i')] } },
          ],
          isActive: true,
        }),
      ]);
      results.services = { data: services, total: servicesTotal };
    }

    if (type === 'all' || type === 'providers') {
      const [providers, providersTotal] = await Promise.all([
        ServiceProvider.find({
          $or: [
            { name: query },
            { description: query },
            { servicesOffered: { $in: [new RegExp(q, 'i')] } },
          ],
          isActive: true,
        }).select('name description logo rating totalReviews servicesOffered').skip(skip).limit(limit),
        ServiceProvider.countDocuments({
          $or: [
            { name: query },
            { description: query },
            { servicesOffered: { $in: [new RegExp(q, 'i')] } },
          ],
          isActive: true,
        }),
      ]);
      results.providers = { data: providers, total: providersTotal };
    }

    if (type === 'all' || type === 'faqs') {
      const [faqs, faqsTotal] = await Promise.all([
        FAQ.find({
          $or: [
            { question: query },
            { answer: query },
            { category: query },
          ],
          isActive: true,
        }).select('question answer category').skip(skip).limit(limit),
        FAQ.countDocuments({
          $or: [
            { question: query },
            { answer: query },
            { category: query },
          ],
          isActive: true,
        }),
      ]);
      results.faqs = { data: faqs, total: faqsTotal };
    }

    if (type === 'all') {
      results.summary = {
        totalResults: (results.services?.total || 0) + (results.providers?.total || 0) + (results.faqs?.total || 0),
      };
    }

    return results;
  }

  /**
   * Search nearby service providers
   */
  async searchNearby({ q, lat, lng, page = 1, limit = 10 } = {}) {
    if (!lat || !lng) {
      return this.search({ q, type: 'providers', page, limit });
    }

    const query = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { servicesOffered: { $in: [new RegExp(q, 'i')] } },
      ];
    }
    query.isActive = true;

    const skip = (page - 1) * limit;

    // Use $geoNear if location coordinates available, otherwise fallback
    const providers = await ServiceProvider.find(query)
      .select('name description logo rating totalReviews servicesOffered location')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    const total = await ServiceProvider.countDocuments(query);

    return {
      data: providers,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get search suggestions
   */
  async getSuggestions({ q, limit = 5 } = {}) {
    const query = { $regex: q, $options: 'i' };

    const [services, providers, faqs] = await Promise.all([
      ServiceCategory.find({ name: query, isActive: true }).select('name').limit(limit),
      ServiceProvider.find({ name: query, isActive: true }).select('name').limit(limit),
      FAQ.find({ question: query, isActive: true }).select('question').limit(limit),
    ]);

    return {
      suggestions: [
        ...services.map(s => ({ type: 'service', text: s.name })),
        ...providers.map(p => ({ type: 'provider', text: p.name })),
        ...faqs.map(f => ({ type: 'faq', text: f.question })),
      ].slice(0, limit),
    };
  }
}

module.exports = new SearchService();
