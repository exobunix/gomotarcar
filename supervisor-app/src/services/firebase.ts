import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const FCM_TOKEN_KEY = '@fcm_token';

class FirebaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        const fcmToken = await messaging().getToken();
        await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
        await this.registerToken(fcmToken);
        messaging().onTokenRefresh(async (newToken) => {
          await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
          await this.registerToken(newToken);
        });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Firebase init failed:', error);
    }
  }

  async registerToken(fcmToken: string): Promise<void> {
    try { await api.patch('/auth/fcm-token', { fcmToken }); } catch { /* ignore */ }
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(FCM_TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    try { await api.patch('/auth/fcm-token', { fcmToken: null }); } catch { /* ignore */ }
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
