import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Stack = createNativeStackNavigator();

const ReportsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ReportsMain" component={ReportsScreen} />
  </Stack.Navigator>
);

export default ReportsStackNavigator;
