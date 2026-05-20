import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://samu-mcqs.onrender.com/api',
});

// Request interceptor to add JWT token and user-id
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const admin = useAuthStore.getState().admin;
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

// Response interceptor to handle token expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
