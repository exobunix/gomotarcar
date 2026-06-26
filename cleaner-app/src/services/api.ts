import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Render free tier spins down after inactivity — first request can take ~30-50s
const API_BASE_URL = __DEV__
  ? 'http://192.168.0.109:5000/api/v1'
  : 'https://gomotarcar.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45s to handle Render cold starts
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    }
    return Promise.reject(error);
  }
);

export default api;
