import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../types/navigation';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DailyWorkMonitoringScreen from '../screens/work-monitoring/DailyWorkMonitoringScreen';
import WorkApprovalDetailScreen from '../screens/work-monitoring/WorkApprovalDetailScreen';
import RejectionHandlingScreen from '../screens/work-monitoring/RejectionHandlingScreen';
import NewOnboardingScreen from '../screens/customers/NewOnboardingScreen';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="DailyWorkMonitoring" component={DailyWorkMonitoringScreen} />
    <Stack.Screen name="WorkApproval" component={WorkApprovalDetailScreen} />
    <Stack.Screen name="RejectionHandling" component={RejectionHandlingScreen} />
    <Stack.Screen name="OnboardingDashboard" component={NewOnboardingScreen} />
    <Stack.Screen name="Notifications" component={NotificationListScreen} />
  </Stack.Navigator>
);

export default DashboardStackNavigator;
