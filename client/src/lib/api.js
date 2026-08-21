import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sarastm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const listingAPI = {
  generate: (formData) => api.post('/api/listing/generate', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id) => api.get(`/api/listing/${id}`),
  update: (id, data) => api.patch(`/api/listing/${id}`, data),
  publish: (id) => api.post(`/api/listing/${id}/publish`),
  getMyListings: () => api.get('/api/listing/my'),
};

export const imagesAPI = {
  upload: (formData) => api.post('/api/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  enhance: (productId, backdropName) => api.post('/api/images/enhance', { productId, backdropName }),
  getByProduct: (productId) => api.get(`/api/images/${productId}`),
};

export const passportAPI = {
  generate: (productId) => api.post(`/api/passport/generate/${productId}`),
  getByProduct: (productId) => api.get(`/api/passport/${productId}`),
};

export const complianceAPI = {
  getHSN: (description) => api.post('/api/compliance/hsn', { description }),
  generateExportPDF: (productId) => api.post(`/api/compliance/export-pdf/${productId}`, {}, { responseType: 'blob' }),
};

export const paymentsAPI = {
  createOrder: (data) => api.post('/api/payments/create-order', data),
  verify: (data) => api.post('/api/payments/verify', data),
  simulatePayout: (escrowId) => api.post('/api/payments/simulate-payout', { escrowId }),
  getEscrowEntries: () => api.get('/api/payments/escrow'),
  getPayouts: () => api.get('/api/payments/payouts'),
  downloadEFIRA: (payoutId) => api.get(`/api/payments/efira/${payoutId}`, { responseType: 'blob' }),
};

export const buyerAPI = {
  getProducts: (params) => api.get('/api/buyer/products', { params }),
  getProduct: (id) => api.get(`/api/buyer/products/${id}`),
  getMyOrders: () => api.get('/api/buyer/orders'),
  getOrder: (id) => api.get(`/api/buyer/orders/${id}`),
  toggleWishlist: (productId) => api.post('/api/buyer/wishlist/toggle', { productId }),
  getWishlist: () => api.get('/api/buyer/wishlist'),
  updateOrderStatus: (orderId, status) => api.patch(`/api/buyer/orders/${orderId}/status`, { status }),
};

export const reviewsAPI = {
  create: (data) => api.post('/api/reviews', data),
  getByProduct: (productId) => api.get(`/api/reviews/${productId}`),
};

export default api;
