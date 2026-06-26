import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../types/navigation';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import NotificationCenterScreen from '../screens/notifications/NotificationCenterScreen';
import TrainingVideosScreen from '../screens/training/TrainingVideosScreen';
import TrainingDetailScreen from '../screens/training/TrainingDetailScreen';
import SupportHubScreen from '../screens/support/SupportHubScreen';
import RaiseTicketScreen from '../screens/support/RaiseTicketScreen';
import LeaveManagementScreen from '../screens/leave/LeaveManagementScreen';
import ApplyLeaveScreen from '../screens/leave/ApplyLeaveScreen';
import LeaveDetailScreen from '../screens/leave/LeaveDetailScreen';
import PerformanceScreen from '../screens/performance/PerformanceScreen';
import AchievementsScreen from '../screens/achievements/AchievementsScreen';
import TaskHistoryScreen from '../screens/history/TaskHistoryScreen';
import EarningsHistoryScreen from '../screens/history/EarningsHistoryScreen';
import CustomerReviewsScreen from '../screens/performance/CustomerReviewsScreen';
import IssueTrackingScreen from '../screens/issues/IssueTrackingScreen';
import ReportIssueScreen from '../screens/issues/ReportIssueScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} />
    <Stack.Screen name="Notifications" component={NotificationCenterScreen} />
    <Stack.Screen name="Training" component={TrainingVideosScreen} />
    <Stack.Screen name="TrainingDetail" component={TrainingDetailScreen} />
    <Stack.Screen name="Support" component={SupportHubScreen} />
    <Stack.Screen name="RaiseTicket" component={RaiseTicketScreen} />
    <Stack.Screen name="LeaveManagement" component={LeaveManagementScreen} />
    <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
    <Stack.Screen name="LeaveDetail" component={LeaveDetailScreen} />
    <Stack.Screen name="Performance" component={PerformanceScreen} />
    <Stack.Screen name="CustomerReviews" component={CustomerReviewsScreen} />
    <Stack.Screen name="Achievements" component={AchievementsScreen} />
    <Stack.Screen name="TaskHistory" component={TaskHistoryScreen} />
    <Stack.Screen name="EarningsHistory" component={EarningsHistoryScreen} />
    <Stack.Screen name="IssueTracking" component={IssueTrackingScreen} />
    <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
  </Stack.Navigator>
);

export default DashboardStackNavigator;
