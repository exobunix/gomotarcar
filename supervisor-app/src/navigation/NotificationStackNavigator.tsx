import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';

const Stack = createNativeStackNavigator();

const NotificationStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationsMain" component={NotificationListScreen} />
  </Stack.Navigator>
);

export default NotificationStackNavigator;
