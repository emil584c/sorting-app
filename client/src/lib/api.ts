import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

// Categories API calls
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  
  getById: (id: string) => api.get(`/categories/${id}`),
  
  create: (data: any) => api.post('/categories', data),
  
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Items API calls
export const itemsApi = {
  getAll: (params?: { category_id?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/items', { params }),
  
  getById: (id: string) => api.get(`/items/${id}`),
  
  create: (data: any) => api.post('/items', data),
  
  update: (id: string, data: any) => api.put(`/items/${id}`, data),
  
  delete: (id: string) => api.delete(`/items/${id}`),
  
  bulkUpdate: (itemIds: string[], updates: any) =>
    api.patch('/items/bulk', { itemIds, updates }),
};

// Upload API calls
export const uploadApi = {
  single: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  multiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (path: string) => api.delete(`/upload/${encodeURIComponent(path)}`),
};