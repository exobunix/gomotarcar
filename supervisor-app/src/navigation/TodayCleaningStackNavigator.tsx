import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayCleaningStackParamList } from '../types/navigation';
import DailyWorkMonitoringScreen from '../screens/work-monitoring/DailyWorkMonitoringScreen';

const Stack = createNativeStackNavigator<TodayCleaningStackParamList>();

const TodayCleaningStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TodayCleaningMain" component={DailyWorkMonitoringScreen} />
  </Stack.Navigator>
);

export default TodayCleaningStackNavigator;
