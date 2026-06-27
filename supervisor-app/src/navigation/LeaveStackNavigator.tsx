import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeaveManagementScreen from '../screens/leaves/LeaveManagementScreen';

const Stack = createNativeStackNavigator();

const LeaveStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LeaveManagementMain" component={LeaveManagementScreen} />
  </Stack.Navigator>
);

export default LeaveStackNavigator;
