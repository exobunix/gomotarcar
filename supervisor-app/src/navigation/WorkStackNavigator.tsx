import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkStackParamList } from '../types/navigation';
import WorkApprovalCenterScreen from '../screens/work-monitoring/WorkApprovalCenterScreen';
import WorkApprovalDetailScreen from '../screens/work-monitoring/WorkApprovalDetailScreen';
import RejectionHandlingScreen from '../screens/work-monitoring/RejectionHandlingScreen';

const Stack = createNativeStackNavigator<WorkStackParamList>();

const WorkStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="WorkDashboard" component={WorkApprovalCenterScreen} />
    <Stack.Screen name="WorkApprovalList" component={WorkApprovalCenterScreen} />
    <Stack.Screen name="WorkApprovalDetail" component={WorkApprovalDetailScreen} />
    <Stack.Screen name="RejectionList" component={RejectionHandlingScreen} />
    <Stack.Screen name="RejectionDetail" component={WorkApprovalDetailScreen} />
  </Stack.Navigator>
);

export default WorkStackNavigator;
