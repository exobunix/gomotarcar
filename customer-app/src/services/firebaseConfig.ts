import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const FCM_TOKEN_KEY = '@fcm_token';

class FirebaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Request permission (iOS)
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Get FCM token
        const fcmToken = await messaging().getToken();
        await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
        await this.registerToken(fcmToken);

        // Listen for token refresh
        messaging().onTokenRefresh(async (newToken) => {
          await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
          await this.registerToken(newToken);
        });

        // Listen for foreground messages
        messaging().onMessage(async (remoteMessage) => {
          console.log('Foreground message:', remoteMessage);
        });

        // Handle notification opened from background
        messaging().onNotificationOpenedApp((remoteMessage) => {
          console.log('Notification opened (background):', remoteMessage);
        });

        // Check if app was opened from a notification (killed state)
        const initialMessage = await messaging().getInitialNotification();
        if (initialMessage) {
          console.log('App opened from notification (killed):', initialMessage);
        }
      }

      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }

  async registerToken(fcmToken: string): Promise<void> {
    try {
      await api.patch('/auth/fcm-token', { fcmToken });
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(FCM_TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    try {
      await api.patch('/auth/fcm-token', { fcmToken: null });
    } catch (error) {
      console.error('Failed to remove FCM token:', error);
    }
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
