import api from './api';

const dashboardApi = {
  // GET /api/v1/dashboard/all — ALL dashboard data in one call
  getAll: () => api.get('/dashboard/all'),

  // GET /api/v1/dashboard/admin — full platform overview (legacy)
  getAdmin: () => api.get('/dashboard/admin'),

  // GET /api/v1/dashboard/revenue?period=7d|30d|90d|1y
  getRevenue: (period = '7d') => api.get(`/dashboard/revenue?period=${period}`),

  // GET /api/v1/dashboard/bookings?period=7d|30d|90d|1y
  getBookings: (period = '7d') => api.get(`/dashboard/bookings?period=${period}`),

  // GET /api/v1/dashboard/customers?period=7d|30d|90d|1y
  getCustomers: (period = '7d') => api.get(`/dashboard/customers?period=${period}`),

  // GET /api/v1/dashboard/activities?limit=20
  getActivities: (limit = 20) => api.get(`/dashboard/activities?limit=${limit}`),

  // GET /api/v1/dashboard/top-cleaners?page=1&limit=10&sort=earnings&order=desc&search=
  getTopCleaners: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.sort) query.set('sort', params.sort);
    if (params.order) query.set('order', params.order);
    if (params.search) query.set('search', params.search);
    return api.get(`/dashboard/top-cleaners?${query.toString()}`);
  },

  // GET /api/v1/dashboard/pending-approvals
  getPendingApprovals: () => api.get('/dashboard/pending-approvals'),

  // Cleaner dashboard
  getCleanerDashboard: (userId) => api.get(`/dashboard/cleaner/${userId}`),

  // Customer dashboard
  getCustomerDashboard: (userId) => api.get(`/dashboard/customer/${userId}`),

  // Franchise dashboard
  getFranchiseDashboard: (userId) => api.get(`/dashboard/franchise/${userId}`),
};

export default dashboardApi;
