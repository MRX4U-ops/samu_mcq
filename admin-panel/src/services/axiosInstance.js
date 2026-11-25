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
  timeout: 25000,
});

// Request interceptor: always attach the freshest Supabase JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().token;
    const admin = useAuthStore.getState().admin;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const expiresSoon = session.expires_at && (session.expires_at * 1000 - Date.now() < 30000);
        if (expiresSoon) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session?.access_token) {
            token = refreshed.session.access_token;
          } else {
            token = session.access_token;
          }
        } else {
          token = session.access_token;
        }
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

// Response interceptor: refresh token & retry on 401; retry once on Render cold-start 502/503/network error
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !original._retriedAuth) {
      original._retriedAuth = true;
      try {
        const { data: refreshed } = await supabase.auth.refreshSession();
        const newTok = refreshed?.session?.access_token;
        if (newTok) {
          const admin = useAuthStore.getState().admin;
          if (admin) useAuthStore.getState().setAuth(admin, newTok);
          original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newTok}` };
          return axiosInstance(original);
        }
      } catch {}

      useAuthStore.getState().logout();
      window.location.hash = '#/login';
      return Promise.reject(error);
    }

    if ((!error.response || status === 502 || status === 503 || status === 504) && !original._retriedNet) {
      original._retriedNet = true;
      await new Promise((r) => setTimeout(r, 1500));
      return axiosInstance(original);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
