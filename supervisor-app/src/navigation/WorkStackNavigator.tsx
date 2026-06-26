import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkStackParamList } from '../types/navigation';
import DailyWorkMonitoringScreen from '../screens/work-monitoring/DailyWorkMonitoringScreen';
import WorkApprovalDetailScreen from '../screens/work-monitoring/WorkApprovalDetailScreen';
import RejectionHandlingScreen from '../screens/work-monitoring/RejectionHandlingScreen';

const Stack = createNativeStackNavigator<WorkStackParamList>();

const WorkStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WorkDashboard" component={DailyWorkMonitoringScreen} />
    <Stack.Screen name="WorkApprovalList" component={DailyWorkMonitoringScreen} />
    <Stack.Screen name="WorkApprovalDetail" component={WorkApprovalDetailScreen} />
    <Stack.Screen name="RejectionList" component={RejectionHandlingScreen} />
    <Stack.Screen name="RejectionDetail" component={WorkApprovalDetailScreen} />
  </Stack.Navigator>
);

export default WorkStackNavigator;
