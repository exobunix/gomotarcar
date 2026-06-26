import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NotificationsStackParamList } from '../types/navigation';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

const NotificationsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationsMain" component={NotificationListScreen} />
  </Stack.Navigator>
);

export default NotificationsStackNavigator;
