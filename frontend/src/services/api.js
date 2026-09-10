import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Centralized Request Interceptor to attach Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  }
);

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verifyOTP: async (payload) => {
    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const vaultAPI = {
  getAll: async () => {
    const response = await api.get('/vault');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/vault/${id}`);
    return response.data;
  },

  create: async (entryData) => {
    const response = await api.post('/vault', entryData);
    return response.data;
  },

  update: async (id, entryData) => {
    const response = await api.put(`/vault/${id}`, entryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vault/${id}`);
    return response.data;
  }
};

export default api;
