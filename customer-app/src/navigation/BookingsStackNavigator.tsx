import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '../types/navigation';
import BookingListScreen from '../screens/bookings/BookingListScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import WriteReviewScreen from '../screens/reviews/WriteReviewScreen';

const Stack = createNativeStackNavigator<BookingsStackParamList>();

const BookingsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BookingList" component={BookingListScreen} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
    <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
  </Stack.Navigator>
);

export default BookingsStackNavigator;
