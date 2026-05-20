import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/Constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

const CACHE_KEYS = {
  PROFILE: '@user_profile_cache',
  SUBSCRIPTION: '@user_subscription_cache',
  PERFORMANCE: '@user_performance_cache',
  HISTORY: '@user_history_cache',
};

export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      await AsyncStorage.setItem(CACHE_KEYS.PROFILE, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.PROFILE);
      if (cachedData) return JSON.parse(cachedData);
      throw error;
    }
  },

  getSubscriptionStatus: async () => {
    try {
      const response = await api.get('/users/subscription-status');
      await AsyncStorage.setItem(CACHE_KEYS.SUBSCRIPTION, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.SUBSCRIPTION);
      if (cachedData) return JSON.parse(cachedData);
      return { status: 'offline', isActive: false, daysRemaining: 0 };
    }
  },

  getPerformance: async () => {
    try {
      const response = await api.get('/users/performance');
      await AsyncStorage.setItem(CACHE_KEYS.PERFORMANCE, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.PERFORMANCE);
      if (cachedData) return JSON.parse(cachedData);
      return { total: 0, correct: 0, wrong: 0, accuracy: 0 };
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get('/users/history');
      await AsyncStorage.setItem(CACHE_KEYS.HISTORY, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.HISTORY);
      if (cachedData) return JSON.parse(cachedData);
      return [];
    }
  },

  getBookmarks: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data.bookmarks || [];
    } catch (error) {
      const cachedData = await AsyncStorage.getItem(CACHE_KEYS.PROFILE);
      if (cachedData) {
        const profile = JSON.parse(cachedData);
        return profile.bookmarks || [];
      }
      return [];
    }
  },

  toggleBookmark: async (questionId) => {
    const response = await api.post('/users/bookmarks/toggle', { questionId });
    return response.data;
  }
};
