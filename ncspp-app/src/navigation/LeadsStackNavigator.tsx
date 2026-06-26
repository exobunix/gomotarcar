import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LeadManagementScreen from '../screens/leads/LeadManagementScreen';
import LeadDetailScreen from '../screens/leads/LeadDetailScreen';
import LeadAnalyticsScreen from '../screens/analytics/LeadAnalyticsScreen';
import { colors } from '../theme/colors';

export type LeadsStackParamList = {
  LeadManagement: undefined;
  LeadDetail: { leadId: string };
  LeadAnalytics: undefined;
};

const Stack = createNativeStackNavigator<LeadsStackParamList>();

const LeadsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="LeadManagement" component={LeadManagementScreen}
        options={{ title: 'Leads' }} />
      <Stack.Screen name="LeadDetail" component={LeadDetailScreen}
        options={{ title: 'Lead Details' }} />
      <Stack.Screen name="LeadAnalytics" component={LeadAnalyticsScreen}
        options={{ title: 'Analytics' }} />
    </Stack.Navigator>
  );
};

export default LeadsStackNavigator;
