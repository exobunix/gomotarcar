import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../types/navigation';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import NewOnboardingScreen from '../screens/customers/NewOnboardingScreen';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CustomerList" component={CustomerListScreen} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    <Stack.Screen name="NewOnboarding" component={NewOnboardingScreen} />
  </Stack.Navigator>
);

export default CustomerStackNavigator;
