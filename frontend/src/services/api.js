/**
 * API Service Layer
 * Centralized HTTP client using Axios for all backend communication
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (development only)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== Projects API =====

export const getProjects = () => {
  return apiClient.get('/api/projects/');
};

export const getProject = (id) => {
  return apiClient.get(`/api/projects/${id}`);
};

export const createProject = (data) => {
  return apiClient.post('/api/projects/', data);
};

export const updateProject = (id, data) => {
  return apiClient.put(`/api/projects/${id}`, data);
};

export const deleteProject = (id) => {
  return apiClient.delete(`/api/projects/${id}`);
};

// ===== Tasks API =====

export const getTasks = (projectId, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.assignedTo) params.append('assigned_to', filters.assignedTo);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  if (filters.order) params.append('order', filters.order);
  
  const queryString = params.toString();
  const url = `/api/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
  
  return apiClient.get(url);
};

export const getTask = (id) => {
  return apiClient.get(`/api/tasks/${id}`);
};

export const createTask = (data) => {
  return apiClient.post('/api/tasks/', data);
};

export const updateTask = (id, data) => {
  return apiClient.put(`/api/tasks/${id}`, data);
};

export const deleteTask = (id) => {
  return apiClient.delete(`/api/tasks/${id}`);
};

// ===== Team Members API =====

export const getTeamMembers = () => {
  return apiClient.get('/api/team-members/');
};

export const getTeamMember = (id) => {
  return apiClient.get(`/api/team-members/${id}`);
};

export const createTeamMember = (data) => {
  return apiClient.post('/api/team-members/', data);
};

export const updateTeamMember = (id, data) => {
  return apiClient.put(`/api/team-members/${id}`, data);
};

export const deleteTeamMember = (id) => {
  return apiClient.delete(`/api/team-members/${id}`);
};

export default apiClient;
