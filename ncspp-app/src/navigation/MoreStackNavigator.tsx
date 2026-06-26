import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';
import ReviewsRatingsScreen from '../screens/reviews/ReviewsRatingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';

export type MoreStackParamList = {
  Notifications: undefined;
  Reviews: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

const MoreStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Notifications" component={NotificationListScreen}
        options={{ title: 'Notifications' }} />
      <Stack.Screen name="Reviews" component={ReviewsRatingsScreen}
        options={{ title: 'Reviews & Ratings' }} />
      <Stack.Screen name="Profile" component={ProfileScreen}
        options={{ title: 'Profile' }} />
    </Stack.Navigator>
  );
};

export default MoreStackNavigator;
