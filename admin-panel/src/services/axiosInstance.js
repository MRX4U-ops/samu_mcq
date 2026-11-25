import axios from 'axios';
import useAuthStore from '../store/authStore';
import { supabase } from './supabase';

const envBase = import.meta.env.VITE_API_BASE_URL;
const defaultBase =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://samu-mcqs.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: envBase || defaultBase,
});

// Request interceptor to add fresh Supabase JWT token and user-id
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().token;
    const admin = useAuthStore.getState().admin;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
        if (admin && token !== useAuthStore.getState().token) {
          useAuthStore.getState().setAuth(admin, token);
        }
      }
    } catch {}

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (admin && admin.id) {
      config.headers['user-id'] = admin.id;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry cleanly with HashRouter
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
