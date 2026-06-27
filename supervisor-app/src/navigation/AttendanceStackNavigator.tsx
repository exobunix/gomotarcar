import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AttendanceStackParamList } from '../types/navigation';
import DailyAttendanceScreen from '../screens/cleaners/DailyAttendanceScreen';

const Stack = createNativeStackNavigator<AttendanceStackParamList>();

const AttendanceStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DailyAttendance" component={DailyAttendanceScreen} />
  </Stack.Navigator>
);

export default AttendanceStackNavigator;
