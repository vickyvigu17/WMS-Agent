import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com/api' 
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Client APIs
export const clientAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

// Project APIs
export const projectAPI = {
  getByClientId: (clientId) => api.get(`/clients/${clientId}/projects`),
  getById: (id) => api.get(`/projects/${id}`),
  create: (clientId, data) => api.post(`/clients/${clientId}/projects`, data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

// Market Research APIs
export const researchAPI = {
  conduct: (clientId) => api.post(`/clients/${clientId}/research`),
  getByClientId: (clientId) => api.get(`/clients/${clientId}/research`)
};

// Question APIs
export const questionAPI = {
  generate: (projectId) => api.post(`/projects/${projectId}/questions/generate`),
  getByProjectId: (projectId) => api.get(`/projects/${projectId}/questions`),
  updateAnswer: (questionId, data) => api.put(`/questions/${questionId}`, data),
  addCustom: (projectId, data) => api.post(`/projects/${projectId}/questions`, data)
};

// WMS Process APIs
export const wmsProcessAPI = {
  getAll: () => api.get('/wms-processes')
};

// Dashboard APIs
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard')
};

export default api;