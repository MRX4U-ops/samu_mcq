import axios from 'axios';
import { API_URL } from '../config/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add default header for testing, you should replace this with a proper auth token
const getHeaders = async () => {
  return { headers: { userid: 'demo-123' } }; // Hardcoded for demo/testing
};

export const paymentService = {
  createPaymentRequest: async () => {
    const config = await getHeaders();
    const response = await axios.post(`${API_URL}/payment/create`, {}, config);
    return response.data;
  },

  submitPayment: async (transactionId, screenshotUrl = null) => {
    const config = await getHeaders();
    const response = await axios.post(`${API_URL}/payment/submit`, {
      transactionId,
      screenshotUrl
    }, config);
    return response.data;
  },

  getPaymentStatus: async () => {
    const config = await getHeaders();
    const response = await axios.get(`${API_URL}/payment/status`, config);
    return response.data;
  }
};
