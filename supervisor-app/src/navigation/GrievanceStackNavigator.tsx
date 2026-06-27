import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GrievanceStackParamList } from '../types/navigation';
import GrievanceListScreen from '../screens/grievances/GrievanceListScreen';
import GrievanceDetailScreen from '../screens/grievances/GrievanceDetailScreen';

const Stack = createNativeStackNavigator<GrievanceStackParamList>();

const GrievanceStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GrievanceList" component={GrievanceListScreen} />
    <Stack.Screen name="GrievanceDetail" component={GrievanceDetailScreen} />
  </Stack.Navigator>
);

export default GrievanceStackNavigator;
