import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';

import DashboardStackNavigator from './DashboardStackNavigator';
import TasksStackNavigator from './TasksStackNavigator';
import EarningsStackNavigator from './EarningsStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';
import ScanScreen from '../screens/scan/ScanScreen';

// Wrap ScanScreen to prevent React Navigation passing invalid 'name' prop warning
const ScanTab: React.FC<any> = (props) => <ScanScreen {...props} />;

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => {
  const icons: Record<string, string> = {
    Dashboard: '🏠', Tasks: '📋', Scan: '📱', Earnings: '💰', Profile: '👤',
  };
  return (
    <Text style={[tabIconStyles.icon, focused && tabIconStyles.focused]}>
      {icons[label] || '•'}
    </Text>
  );
};

const tabIconStyles = StyleSheet.create({
  icon: { fontSize: 22, opacity: 0.5 },
  focused: { opacity: 1 },
});

const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primaryBlue,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        fontWeight: '500',
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardStackNavigator}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} /> }}
    />
    <Tab.Screen
      name="Tasks"
      component={TasksStackNavigator}
      options={{ tabBarLabel: 'Tasks', tabBarIcon: ({ focused }) => <TabIcon label="Tasks" focused={focused} /> }}
    />
    <Tab.Screen
      name="Scan"
      component={ScanTab}
      options={{ tabBarLabel: 'Scan QR', tabBarIcon: ({ focused }) => <TabIcon label="Scan" focused={focused} /> }}
    />
    <Tab.Screen
      name="Earnings"
      component={EarningsStackNavigator}
      options={{ tabBarLabel: 'Earnings', tabBarIcon: ({ focused }) => <TabIcon label="Earnings" focused={focused} /> }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStackNavigator}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} /> }}
    />
  </Tab.Navigator>
);

export default MainTabNavigator;
