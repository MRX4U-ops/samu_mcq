import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';

const getDevBaseUrl = () => {
  // Priority 1: Expo hostUri (Reliable for Expo Go)
  const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip.includes('exp.direct')) {
      // Tunnel detected! Return the local machine IP for the backend
      console.log('Tunnel detected, using local machine IP 10.45.70.102 for backend.');
      return 'http://10.45.70.102:5000';
    }
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  // Priority 2: NativeModules SourceCode scriptURL
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/http:\/\/([^:\/]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:5000`;
    }
  }

  // Priority 3: Platform specific loopbacks
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://10.45.70.102:5000';
};

const BASE_URL = __DEV__ ? getDevBaseUrl() : 'https://samu-mcqs.onrender.com';


// DEBUG LOGGING
if (__DEV__) {
  console.log('--- API CONFIGURATION ---');
  console.log('BASE_URL:', BASE_URL);
  console.log('------------------------');
}


export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export const ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  SIGNUP: `${API_URL}/auth/signup`,
  COURSES: `${API_URL}/courses`,
  AI_ASK: `${API_URL}/ai/ask`,
  AI_SCAN: `${API_URL}/ai/analyze-image`,
  PAYMENTS: `${API_URL}/payments`,
  SUPPORT: `${API_URL}/support`,
  USERS: `${API_URL}/users`,
};
