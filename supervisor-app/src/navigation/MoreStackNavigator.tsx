import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../types/navigation';
import ProfileScreen from '../screens/profile/ProfileScreen';
import GrievanceListScreen from '../screens/grievances/GrievanceListScreen';
import GrievanceDetailScreen from '../screens/grievances/GrievanceDetailScreen';
import InventoryListScreen from '../screens/inventory/InventoryListScreen';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';
import QRListScreen from '../screens/qr/QRListScreen';
import InventoryDetailScreen from '../screens/inventory/InventoryDetailScreen';
import QRAssignmentScreen from '../screens/qr/QRAssignmentScreen';
import QRReassignmentScreen from '../screens/qr/QRReassignmentScreen';
import SalaryIncentivesScreen from '../screens/salary/SalaryIncentivesScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileManagementScreen from '../screens/profile/ProfileManagementScreen';
import SupportCenterScreen from '../screens/support/SupportCenterScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

const MoreStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreMain" component={ProfileScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="GrievanceManagement" component={GrievanceListScreen} />
    <Stack.Screen name="GrievanceList" component={GrievanceListScreen} />
    <Stack.Screen name="GrievanceDetail" component={GrievanceDetailScreen} />
    <Stack.Screen name="InventoryManagement" component={InventoryListScreen} />
    <Stack.Screen name="InventoryList" component={InventoryListScreen} />
    <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationListScreen} />
    <Stack.Screen name="QRList" component={QRListScreen} />
    <Stack.Screen name="QRAssignment" component={QRAssignmentScreen} />
    <Stack.Screen name="QRReassignment" component={QRReassignmentScreen} />
    <Stack.Screen name="SalaryIncentives" component={SalaryIncentivesScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="ProfileManagement" component={ProfileManagementScreen} />
    <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
  </Stack.Navigator>
);

export default MoreStackNavigator;
