import axios from 'axios';

const API_URL = 'https://nammamart-backend.onrender.com/api';

export const BASE_IMAGE_URL='https://nammamart-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to parse userInfo for token", e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  login: (data: any) => api.post('/users/login', data),
  register: (data: any) => api.post('/users', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getUsers: () => api.get('/users'),
};

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const orderService = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getOrderById: (id: string) => api.get(`/orders/${id}`),
  getAllOrders: () => api.get('/orders'),
  markAsPaid: (id: string, paymentResult?: any) => api.put(`/orders/${id}/pay`, paymentResult || {}),
  markAsDelivered: (id: string) => api.put(`/orders/${id}/deliver`),
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
};

export const paymentService = {
  createRazorpayOrder: (amount: number) => api.post('/payment/create-order', { amount }),
  verifyPayment: (data: any) => api.post('/payment/verify', data),
};

export const settingsService = {
  getSetting: (key: string) => api.get(`/settings/${key}`),
  updateSetting: (data: { key: string; value: string }) => api.post('/settings', data),
};

export const uploadService = {
  uploadImage: (formData: FormData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
