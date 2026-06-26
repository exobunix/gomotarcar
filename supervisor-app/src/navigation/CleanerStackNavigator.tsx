import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CleanerStackParamList } from '../types/navigation';
import CleanerListScreen from '../screens/cleaners/CleanerListScreen';
import CleanerDetailScreen from '../screens/cleaners/CleanerDetailScreen';
import SalaryIncentivesScreen from '../screens/salary/SalaryIncentivesScreen';
import SalaryDetailScreen from '../screens/salary/SalaryDetailScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import NewOnboardingScreen from '../screens/customers/NewOnboardingScreen';

const Stack = createNativeStackNavigator<CleanerStackParamList>();

const CleanerStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CleanerList" component={CleanerListScreen} />
    <Stack.Screen name="CleanerDetail" component={CleanerDetailScreen} />
    <Stack.Screen name="SalaryIncentives" component={SalaryIncentivesScreen} />
    <Stack.Screen name="SalaryDetail" component={SalaryDetailScreen} />
  </Stack.Navigator>
);

export default CleanerStackNavigator;
