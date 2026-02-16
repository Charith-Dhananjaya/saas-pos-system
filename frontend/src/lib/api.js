import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Backend expects standard Bearer token format
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (userData) => api.post('/auth/login', userData),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  getUserById: (id) => api.get(`/api/user/${id}`),
  updateProfile: (data) => {
    // If data is FormData, let the browser set the Content-Type with boundary
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return api.put('/api/user/profile', data, config);
  },
};

// Store APIs
export const storeAPI = {
  create: (storeData) => api.post('/api/store', storeData),
  getAll: () => api.get('/api/store'),
  getById: (id) => api.get(`/api/store/${id}`),
  getByAdmin: () => api.get('/api/store/admin'),
  getByEmployee: () => api.get('/api/store/employee'),
  update: (id, storeData) => api.put(`/api/store/${id}`, storeData),
  moderate: (id, status) => api.put(`/api/store/${id}/moderate`, null, { params: { status } }),
  delete: (id) => api.delete(`/api/store/${id}`),
};

// Product APIs
export const productAPI = {
  create: (productData) => api.post('/api/products', productData),
  getByStore: (storeId) => api.get(`/api/products/store/${storeId}`),
  search: (storeId, keyword) => api.get(`/api/products/store/${storeId}/search`, { params: { keyword } }),
  update: (id, productData) => api.patch(`/api/products/${id}`, productData),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Category APIs
export const categoryAPI = {
  create: (categoryData) => api.post('/api/categories', categoryData),
  getByStore: (storeId) => api.get(`/api/categories/store/${storeId}`),
  update: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Inventory APIs
export const inventoryAPI = {
  create: (inventoryData) => api.post('/api/inventories', inventoryData),
  getById: (id) => api.get(`/api/inventories/${id}`),
  getByStore: (storeId) => api.get(`/api/inventories/store/${storeId}`),
  getByProductAndStore: (storeId, productId) => api.get(`/api/inventories/store/${storeId}/product/${productId}`),
  update: (id, inventoryData) => api.put(`/api/inventories/${id}`, inventoryData),
  delete: (id) => api.delete(`/api/inventories/${id}`),
};

// Order APIs
export const orderAPI = {
  create: (orderData) => api.post('/api/orders', orderData),
  getById: (id) => api.get(`/api/orders/${id}`),
  getByStore: (storeId, filters = {}) => {
    const params = {};
    if (filters.customerId) params.customerId = filters.customerId;
    if (filters.cashierId) params.cashierId = filters.cashierId;
    if (filters.paymentType) params.paymentType = filters.paymentType;
    if (filters.orderStatus) params.orderStatus = filters.orderStatus;
    return api.get(`/api/orders/store/${storeId}`, { params });
  },
  getTodayOrders: (storeId) => api.get(`/api/orders/today/store/${storeId}`),
  getRecentOrders: (storeId) => api.get(`/api/orders/recent/store/${storeId}`),
  getByCustomer: (customerId) => api.get(`/api/orders/customer/${customerId}`),
  getByCashier: (cashierId) => api.get(`/api/orders/cashier/${cashierId}`),
  update: (id, orderData) => api.put(`/api/orders/${id}`, orderData),
  delete: (id) => api.delete(`/api/orders/${id}`),
};

// Customer APIs
export const customerAPI = {
  create: (customerData) => api.post('/api/customers', customerData),
  getAll: () => api.get('/api/customers'),
  getById: (id) => api.get(`/api/customers/${id}`),
  search: (query) => api.get('/api/customers/search', { params: { q: query } }),
  update: (id, customerData) => api.put(`/api/customers/${id}`, customerData),
  delete: (id) => api.delete(`/api/customers/${id}`),
};

// Employee APIs
export const employeeAPI = {
  create: (storeId, employeeData) => api.post(`/api/employees/store/${storeId}`, employeeData),
  getByStore: (storeId, role = null) => {
    const params = role ? { userRole: role } : {};
    return api.get(`/api/employees/store/${storeId}`, { params });
  },
  update: (id, employeeData) => api.put(`/api/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/api/employees/${id}`),
};

// Billing APIs (Stripe)
export const billingAPI = {
  createPaymentIntent: (amountCents) => api.post('/api/billing/create-payment-intent', { amountCents }),
  refund: (paymentIntentId, amountCents, reason) =>
    api.post('/api/billing/refund', { paymentIntentId, amountCents, reason }),
};

// Refund APIs
export const refundAPI = {
  create: (refundData) => api.post('/api/refunds', refundData),
  getAll: () => api.get('/api/refunds'),
  getById: (id) => api.get(`/api/refunds/${id}`),
  getByCashier: (cashierId) => api.get(`/api/refunds/cashier/${cashierId}`),
  getByStore: (storeId) => api.get(`/api/refunds/store/${storeId}`),
  getByShift: (shiftId) => api.get(`/api/refunds/shift/${shiftId}`),
  getByCashierAndDateRange: (cashierId, startDate, endDate) =>
    api.get(`/api/refunds/cashier/${cashierId}/range`, {
      params: { startDate, endDate }
    }),
  delete: (id) => api.delete(`/api/refunds/${id}`),
};

// Shift Report APIs
export const shiftReportAPI = {
  startShift: () => api.post('/api/shift-report/start'),
  endShift: () => api.patch('/api/shift-report/end'),
  getCurrentShift: () => api.get('/api/shift-report/current'),
  getByCashier: (cashierId) => api.get(`/api/shift-report/cashier/${cashierId}`),
  getByStore: (storeId) => api.get(`/api/shift-report/store/${storeId}`),
  getByCashierAndDate: (cashierId, date) =>
    api.get(`/api/shift-report/cashier/${cashierId}/by-date`, { params: { date } }),
  getById: (id) => api.get(`/api/shift-report/${id}`),
};

export const analyticsAPI = {
  getDashboardSummary: (storeId) => api.get(`/api/analytics/summary/${storeId}`),
  getRevenueTrend: (storeId, days = 30) => api.get(`/api/analytics/revenue-trend/${storeId}`, { params: { days } }),
  getTopProducts: (storeId, limit = 10) => api.get(`/api/analytics/top-products/${storeId}`, { params: { limit } }),
  getOrderStats: (storeId) => api.get(`/api/analytics/order-stats/${storeId}`),
  getHourlySales: (storeId) => api.get(`/api/analytics/hourly-sales/${storeId}`),
};

export default api;
