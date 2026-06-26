const searchService = require('../services/search.service');

const searchController = {
  /**
   * GET /api/v1/search
   * Full-text search across services, providers, and FAQs
   */
  search: async (req, res, next) => {
    try {
      const results = await searchService.search(req.query);
      res.status(200).json({ success: true, data: results });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/search/nearby
   * Search nearby service providers
   */
  searchNearby: async (req, res, next) => {
    try {
      const results = await searchService.searchNearby(req.query);
      res.status(200).json({ success: true, ...results });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/v1/search/suggestions
   * Get autocomplete suggestions
   */
  getSuggestions: async (req, res, next) => {
    try {
      const suggestions = await searchService.getSuggestions(req.query);
      res.status(200).json({ success: true, ...suggestions });
    } catch (error) { next(error); }
  },
};

module.exports = searchController;
