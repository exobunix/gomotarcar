import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://gomotarcar-api.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap data, handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    const errData = error.response?.data?.error || {};
    const message = errData.message || error.message || 'Something went wrong';
    const code = errData.code || 'UNKNOWN';
    const details = errData.details || null;
    return Promise.reject({ message, code, details, status: error.response?.status });
  }
);

// ─── Helper to build pagination query params ───
const paginationParams = ({ page = 1, limit = 20, ...filters } = {}) => {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', limit);
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });
  return params.toString();
};

// ─── Subscription endpoints ───
export const subscriptionApi = {
  list: (params) => api.get(`/subscriptions?${paginationParams(params)}`),
  getById: (id) => api.get(`/subscriptions/${id}`),
  subscribe: (data) => api.post('/subscriptions', data),
  update: (id, data) => api.patch(`/subscriptions/${id}`, data),
  cancel: (id, data) => api.patch(`/subscriptions/${id}/cancel`, data),
  useCleaning: (id) => api.patch(`/subscriptions/${id}/use-cleaning`),
  getStats: () => api.get('/subscriptions/stats'),
  listPackages: (params) => api.get(`/subscriptions/packages?${paginationParams(params)}`),
  createPackage: (data) => api.post('/subscriptions/packages', data),
  updatePackage: (id, data) => api.put(`/subscriptions/packages/${id}`, data),
};

// ─── Booking endpoints ───
export const bookingApi = {
  list: (params) => api.get(`/bookings?${paginationParams(params)}`),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancel: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
  addExtraCharge: (id, data) => api.post(`/bookings/${id}/extra-charges`, data),
  approveExtraCharge: (id, chargeId) => api.patch(`/bookings/${id}/extra-charges/${chargeId}/approve`),
  generateJobCard: (id) => api.post(`/bookings/${id}/job-card`),
  addReview: (id, data) => api.post(`/bookings/${id}/review`, data),
  getStats: () => api.get('/bookings/stats'),
};

// ─── QR endpoints ───
export const qrApi = {
  list: (params) => api.get(`/qr?${paginationParams(params)}`),
  getById: (id) => api.get(`/qr/${id}`),
  getByCode: (code) => api.get(`/qr/code/${code}`),
  generate: (data) => api.post('/qr', data),
  bulkGenerate: (data) => api.post('/qr/bulk-generate', data),
  activate: (id) => api.patch(`/qr/${id}/activate`),
  delete: (id) => api.delete(`/qr/${id}`),
  reportDamaged: (id, data) => api.patch(`/qr/${id}/damaged`, data),
  replace: (id, data) => api.post(`/qr/${id}/replace`, data),
  scan: (data) => api.post('/qr/scan', data),
  verify: (code) => api.get(`/qr/verify/${code}`),
  getStats: () => api.get('/qr/stats'),
  getAnalytics: (params) => api.get(`/qr/analytics?${new URLSearchParams(params || {}).toString()}`),
  getScanHistory: (id, params) => api.get(`/qr/${id}/history?${paginationParams(params)}`),
  downloadPngUrl: (id) => `${API_BASE}/qr/${id}/download/png`,
  downloadSvgUrl: (id) => `${API_BASE}/qr/${id}/download/svg`,
  downloadPdfUrl: (id) => `${API_BASE}/qr/${id}/download/pdf`,
  imageUrl: (id) => `${API_BASE}/qr/${id}/image`,
};

// ─── Apartment endpoints ───
export const apartmentApi = {
  list: (params) => api.get(`/apartments?${paginationParams(params)}`),
  getById: (id) => api.get(`/apartments/${id}`),
  create: (data) => api.post('/apartments', data),
  update: (id, data) => api.put(`/apartments/${id}`, data),
  setDefault: (id) => api.patch(`/apartments/${id}/default`),
  delete: (id) => api.delete(`/apartments/${id}`),
  listByCustomer: (customerId, params) => api.get(`/apartments/customer/${customerId}?${paginationParams(params)}`),
};

// ─── Vehicle endpoints ───
export const vehicleApi = {
  list: (params) => api.get(`/vehicles?${paginationParams(params)}`),
  getById: (id) => api.get(`/vehicles/${id}`),
  getByNumber: (number) => api.get(`/vehicles/number/${number}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  deactivate: (id) => api.patch(`/vehicles/${id}/deactivate`),
  delete: (id) => api.delete(`/vehicles/${id}`),
  listByCustomer: (customerId, params) => api.get(`/vehicles/customer/${customerId}?${paginationParams(params)}`),
  getStats: () => api.get('/vehicles/stats'),
};

// ─── Payment endpoints ───
export const paymentApi = {
  list: (params) => api.get(`/payments?${paginationParams(params)}`),
  getById: (id) => api.get(`/payments/${id}`),
  getByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  refund: (id, data) => api.post(`/payments/${id}/refund`, data),
  getStats: () => api.get('/payments/stats'),
  walletTopUp: (data) => api.post('/payments/wallet-topup', data),
  completeTopUp: (data) => api.post('/payments/complete-topup', data),
};

// ─── Complaint endpoints ───
export const complaintApi = {
  list: (params) => api.get(`/complaints?${paginationParams(params)}`),
  getById: (id) => api.get(`/complaints/${id}`),
  getByTicket: (ticketNumber) => api.get(`/complaints/ticket/${ticketNumber}`),
  create: (data) => api.post('/complaints', data),
  assign: (id, data) => api.patch(`/complaints/${id}/assign`, data),
  resolve: (id, data) => api.patch(`/complaints/${id}/resolve`, data),
  close: (id, data) => api.patch(`/complaints/${id}/close`, data),
  updatePriority: (id, data) => api.patch(`/complaints/${id}/priority`, data),
  getStats: () => api.get('/complaints/stats'),
};

// ─── Notification endpoints ───
export const notificationApi = {
  list: (params) => api.get(`/notifications?${paginationParams(params)}`),
  send: (data) => api.post('/notifications', data),
  sendBulk: (data) => api.post('/notifications/bulk', data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  getStats: () => api.get('/notifications/stats'),
  listForUser: (userId, params) => api.get(`/notifications/user/${userId}?${paginationParams(params)}`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread`),
};

// ─── Analytics endpoints ───
export const analyticsApi = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getRevenueReport: (params) => api.get(`/analytics/revenue?${new URLSearchParams(params).toString()}`),
  getCleanerPerformance: (params) => api.get(`/analytics/cleaner-productivity?${new URLSearchParams(params).toString()}`),
  getExportData: (params) => api.get(`/analytics/export?${new URLSearchParams(params).toString()}`),
};

// ─── Cleaner endpoints ───
export const cleanerApi = {
  list: (params) => api.get(`/cleaner?${paginationParams(params)}`),
  getById: (id) => api.get(`/cleaner/${id}`),
  create: (data) => api.post('/cleaner', data),
  update: (id, data) => api.put(`/cleaner/${id}`, data),
  delete: (id) => api.delete(`/cleaner/${id}`),
  deactivate: (id) => api.patch(`/cleaner/${id}/deactivate`),
  verify: (id) => api.patch(`/cleaner/${id}/verify`),
  getStats: () => api.get('/cleaner/stats'),
};

// ─── Customer endpoints ───
export const customerApi = {
  list: (params) => api.get(`/customer?${paginationParams(params)}`),
  getById: (id) => api.get(`/customer/${id}`),
  create: (data) => api.post('/customer', data),
  update: (id, data) => api.put(`/customer/${id}`, data),
  deactivate: (id) => api.patch(`/customer/${id}/deactivate`),
  getStats: () => api.get('/customer/stats'),
};

// ─── Task endpoints ───
export const taskApi = {
  list: (params) => api.get(`/tasks?${paginationParams(params)}`),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  assignCleaner: (id, data) => api.patch(`/tasks/${id}/assign`, data),
  start: (id) => api.patch(`/tasks/${id}/start`),
  complete: (id, data) => api.patch(`/tasks/${id}/complete`, data),
  markMissed: (id, data) => api.patch(`/tasks/${id}/miss`, data),
  getStats: () => api.get('/tasks/stats'),
};

// ─── Attendance endpoints ───
export const attendanceApi = {
  list: (params) => api.get(`/attendance?${paginationParams(params)}`),
  getById: (id) => api.get(`/attendance/${id}`),
  getMonthlySummary: (cleanerId, month, year) => api.get(`/attendance/cleaner/${cleanerId}/monthly/${month}/${year}`),
  markAbsent: (cleanerId, data) => api.post(`/attendance/cleaner/${cleanerId}/mark-absent`, data),
  getStats: () => api.get('/attendance/stats'),
};

// ─── Earnings endpoints ───
export const earningsApi = {
  list: (params) => api.get(`/earnings?${paginationParams(params)}`),
  getById: (id) => api.get(`/earnings/${id}`),
  getCleanerSummary: (cleanerId) => api.get(`/earnings/cleaner/${cleanerId}/summary`),
  calculatePeriod: (data) => api.post('/earnings/calculate-period', data),
  getStats: () => api.get('/earnings/stats'),
};

// ─── Franchise endpoints ───
export const franchiseApi = {
  list: (params) => api.get(`/franchise?${paginationParams(params)}`),
  getById: (id) => api.get(`/franchise/${id}`),
  create: (data) => api.post('/franchise', data),
  update: (id, data) => api.put(`/franchise/${id}`, data),
  verify: (id, data) => api.patch(`/franchise/${id}/verify`, data),
  deactivate: (id) => api.patch(`/franchise/${id}/deactivate`),
  delete: (id) => api.delete(`/franchise/${id}`),
  getStats: () => api.get('/franchise/stats'),
};

// ─── Zone endpoints ───
export const zoneApi = {
  list: (params) => api.get(`/zones?${paginationParams(params)}`),
  getById: (id) => api.get(`/zones/${id}`),
  create: (data) => api.post('/zones', data),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`),
  getStats: () => api.get('/zones/stats'),
};

// ─── Marketplace endpoints ───
export const marketplaceApi = {
  listCategories: (params) => api.get(`/services/categories?${paginationParams(params)}`),
  createCategory: (data) => api.post('/services/categories', data),
  updateCategory: (id, data) => api.put(`/services/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/services/categories/${id}`),
  listProviders: (params) => api.get(`/services/providers?${paginationParams(params)}`),
  createProvider: (data) => api.post('/services/providers', data),
  updateProvider: (id, data) => api.put(`/services/providers/${id}`, data),
  deleteProvider: (id) => api.delete(`/services/providers/${id}`),
  getStats: () => api.get('/services/stats'),
};

// ─── Issue endpoints ───
export const issueApi = {
  list: (params) => api.get(`/issues?${paginationParams(params)}`),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.patch(`/issues/${id}`, data),
  delete: (id) => api.delete(`/issues/${id}`),
  getStats: () => api.get('/issues/stats'),
};

// ─── Training endpoints ───
export const trainingApi = {
  listVideos: (params) => api.get(`/training?${paginationParams(params)}`),
  getVideoById: (id) => api.get(`/training/${id}`),
  createVideo: (data) => api.post('/training', data),
  updateVideo: (id, data) => api.put(`/training/${id}`, data),
  deleteVideo: (id) => api.delete(`/training/${id}`),
  trackProgress: (cleanerId, videoId, data) => api.post(`/training/${cleanerId}/progress/${videoId}`, data),
  getProgress: (cleanerId) => api.get(`/training/${cleanerId}/progress`),
  getStats: () => api.get('/training/stats'),
};

// ─── CMS endpoints ───
export const cmsApi = {
  // Banners
  getBanners: (params) => api.get(`/cms/banners?${paginationParams(params)}`),
  getBannerById: (id) => api.get(`/cms/banners/${id}`),
  createBanner: (formData) => api.post('/cms/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id, formData) => api.put(`/cms/banners/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBanner: (id) => api.delete(`/cms/banners/${id}`),
  // Blogs
  getBlogs: (params) => api.get(`/cms/blogs?${paginationParams(params)}`),
  getBlogById: (id) => api.get(`/cms/blogs/${id}`),
  createBlog: (formData) => api.post('/cms/blogs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBlog: (id, formData) => api.put(`/cms/blogs/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteBlog: (id) => api.delete(`/cms/blogs/${id}`),
  // FAQs
  getFAQs: (params) => api.get(`/cms/faqs?${paginationParams(params)}`),
  createFAQ: (data) => api.post('/cms/faqs', data),
  updateFAQ: (id, data) => api.put(`/cms/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/cms/faqs/${id}`),
  // Policies
  getPolicies: () => api.get('/cms/policies'),
  createPolicy: (data) => api.post('/cms/policies', data),
  updatePolicy: (id, data) => api.put(`/cms/policies/${id}`, data),
  // Contact Requests
  getContactRequests: (params) => api.get(`/cms/contact-requests?${paginationParams(params)}`),
  updateContactRequestStatus: (id, status) => api.patch(`/cms/contact-requests/${id}/status`, { status }),
  // Download Links
  getDownloadLinks: () => api.get('/cms/download-links'),
  createDownloadLink: (data) => api.post('/cms/download-links', data),
  updateDownloadLink: (id, data) => api.put(`/cms/download-links/${id}`, data),
  deleteDownloadLink: (id) => api.delete(`/cms/download-links/${id}`),
};

// ─── Report endpoints ───
export const reportsApi = {
  getSummary: (params) => api.get(`/reports/summary?${new URLSearchParams(params || {}).toString()}`),
  getRevenue: (params) => api.get(`/reports/revenue?${new URLSearchParams(params || {}).toString()}`),
  getBookings: (params) => api.get(`/reports/bookings?${new URLSearchParams(params || {}).toString()}`),
  getCleaners: (params) => api.get(`/reports/cleaners?${new URLSearchParams(params || {}).toString()}`),
  getCustomers: (params) => api.get(`/reports/customers?${new URLSearchParams(params || {}).toString()}`),
  getExportData: (reportType, params) => api.get(`/reports/export/${reportType}?${new URLSearchParams(params || {}).toString()}`),
};

// ─── Settings endpoints ───
export const settingsApi = {
  getAll: () => api.get('/settings'),
  getByGroup: (group) => api.get(`/settings/${group}`),
  updateGroup: (group, data) => api.put(`/settings/${group}`, data),
  update: (data) => api.post('/settings', data),
  getPublicSettings: () => api.get('/settings/public'),
};

// ─── Upload endpoints ───
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/**
 * Resolve a relative asset path (e.g. /uploads/logo.png)
 * to a full backend URL for rendering in <img> tags.
 */
export const getAssetUrl = (relativeUrl) => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http')) return relativeUrl;
  // API_BASE is like http://localhost:5000/api/v1, strip the /api/v1 suffix
  const backendBase = API_BASE.replace(/\/api\/v\d+$/, '');
  return `${backendBase}${relativeUrl}`;
};

// ─── Wallet endpoints ───
export const walletApi = {
  getBalance: (ownerType, ownerId) => api.get(`/wallet/${ownerType}/${ownerId}`),
  getTransactions: (ownerType, ownerId, params) => api.get(`/wallet/${ownerType}/${ownerId}/transactions?${paginationParams(params)}`),
  getStats: () => api.get('/wallet/stats'),
};

// ─── Supervisor endpoints ───
export const supervisorApi = {
  list: (params) => api.get(`/supervisor?${paginationParams(params)}`),
  getById: (id) => api.get(`/supervisor/${id}`),
  create: (data) => api.post('/supervisor', data),
  update: (id, data) => api.put(`/supervisor/${id}`, data),
  delete: (id) => api.delete(`/supervisor/${id}`),
  deactivate: (id) => api.patch(`/supervisor/${id}/deactivate`),
  verify: (id) => api.patch(`/supervisor/${id}/verify`),
  getStats: () => api.get('/supervisor/stats'),
  allocateApartment: (id, data) => api.post(`/supervisor/${id}/allocate-apartment`, data),
  allocateCleaner: (id, data) => api.post(`/supervisor/${id}/allocate-cleaner`, data),
  allocateQr: (id, data) => api.post(`/supervisor/${id}/allocate-qr`, data),
  approveWork: (id, data) => api.post(`/supervisor/${id}/approve-work`, data),
  rejectWork: (id, data) => api.post(`/supervisor/${id}/reject-work`, data),
};

// ─── NCSP Partner endpoints ───
export const ncspApi = {
  list: (params) => api.get(`/ncsp?${paginationParams(params)}`),
  getById: (id) => api.get(`/ncsp/${id}`),
  create: (data) => api.post('/ncsp', data),
  update: (id, data) => api.put(`/ncsp/${id}`, data),
  delete: (id) => api.delete(`/ncsp/${id}`),
  deactivate: (id) => api.patch(`/ncsp/${id}/deactivate`),
  verify: (id) => api.patch(`/ncsp/${id}/verify`),
  getStats: () => api.get('/ncsp/stats'),
};

// ─── Admin/Operations Team endpoints ───
export const adminApi = {
  list: (params) => api.get(`/admin?${paginationParams(params)}`),
  getById: (id) => api.get(`/admin/${id}`),
  create: (data) => api.post('/admin', data),
  update: (id, data) => api.put(`/admin/${id}`, data),
  updatePermissions: (id, permissions) => api.patch(`/admin/${id}/permissions`, { permissions }),
  deactivate: (id) => api.patch(`/admin/${id}/deactivate`),
  delete: (id) => api.delete(`/admin/${id}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
