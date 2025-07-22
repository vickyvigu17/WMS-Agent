import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Client API calls
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Project API calls
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getByClient: (clientId) => api.get(`/clients/${clientId}/projects`),
  getById: (id) => api.get(`/projects/${id}`),
  create: (clientId, data) => api.post(`/clients/${clientId}/projects`, data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

// Market Research API calls
export const researchAPI = {
  getByClient: (clientId) => api.get(`/clients/${clientId}/research`),
  conduct: (clientId, researchType) => api.post(`/clients/${clientId}/research`, { research_type: researchType }),
};

// Questions API calls
export const questionsAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/questions`),
  generate: (projectId, questionTypes) => api.post(`/projects/${projectId}/questions/generate`, { question_types: questionTypes }),
  answer: (id, answer) => api.put(`/questions/${id}/answer`, { answer }),
  create: (projectId, data) => api.post(`/projects/${projectId}/questions`, data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

// WMS Processes API calls
export const wmsProcessesAPI = {
  getAll: () => api.get('/wms-processes'),
  getById: (id) => api.get(`/wms-processes/${id}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard'),
};

export default api;
