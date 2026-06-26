import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ServicesStackParamList } from '../types/navigation';
import ServicesScreen from '../screens/services/ServicesScreen';
import ComplaintListScreen from '../screens/complaints/ComplaintListScreen';
import CreateComplaintScreen from '../screens/complaints/CreateComplaintScreen';
import ComplaintDetailScreen from '../screens/complaints/ComplaintDetailScreen';
import PaymentHistoryScreen from '../screens/payments/PaymentHistoryScreen';

const Stack = createNativeStackNavigator<ServicesStackParamList>();

const ServicesStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ServicesMain" component={ServicesScreen} />
    <Stack.Screen name="ComplaintList" component={ComplaintListScreen} />
    <Stack.Screen name="CreateComplaint" component={CreateComplaintScreen} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
  </Stack.Navigator>
);

export default ServicesStackNavigator;
