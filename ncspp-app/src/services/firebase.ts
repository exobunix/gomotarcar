import messaging from '@react-native-firebase/messaging';
import { api } from './api';

export const firebaseService = {
  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const token = await messaging().getToken();
        await this.registerToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.log('Firebase permission error:', error);
      return null;
    }
  },

  async registerToken(token: string) {
    try {
      await api.post('/franchise/device-token', { token, platform: 'react-native' });
    } catch (error) {
      console.log('Token registration error:', error);
    }
  },

  onMessage(callback: (message: any) => void) {
    return messaging().onMessage(callback);
  },

  onNotificationOpenedApp(callback: (message: any) => void) {
    return messaging().onNotificationOpenedApp(callback);
  },

  async getInitialNotification() {
    return messaging().getInitialNotification();
  },
};

export default firebaseService;
