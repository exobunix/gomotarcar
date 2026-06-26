import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';

import DashboardStackNavigator from './DashboardStackNavigator';
import ApartmentStackNavigator from './ApartmentStackNavigator';
import CustomerStackNavigator from './CustomerStackNavigator';
import CleanerStackNavigator from './CleanerStackNavigator';
import WorkStackNavigator from './WorkStackNavigator';
import MoreStackNavigator from './MoreStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => {
  const icons: Record<string, string> = {
    DashboardTab: '🏠',
    ApartmentsTab: '🏢',
    CustomersTab: '👥',
    CleanersTab: '🧹',
    WorkTab: '📋',
    MoreTab: '⚙️',
  };
  return (
    <Text style={[tabStyles.icon, focused && tabStyles.focused]}>
      {icons[label] || '•'}
    </Text>
  );
};

const tabStyles = StyleSheet.create({
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
      tabBarLabelStyle: { fontSize: 10, fontFamily: 'Inter-Medium', fontWeight: '500' },
    }}
  >
    <Tab.Screen name="DashboardTab" component={DashboardStackNavigator}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="DashboardTab" focused={focused} /> }}
    />
    <Tab.Screen name="ApartmentsTab" component={ApartmentStackNavigator}
      options={{ tabBarLabel: 'Apartments', tabBarIcon: ({ focused }) => <TabIcon label="ApartmentsTab" focused={focused} /> }}
    />
    <Tab.Screen name="CustomersTab" component={CustomerStackNavigator}
      options={{ tabBarLabel: 'Customers', tabBarIcon: ({ focused }) => <TabIcon label="CustomersTab" focused={focused} /> }}
    />
    <Tab.Screen name="CleanersTab" component={CleanerStackNavigator}
      options={{ tabBarLabel: 'Cleaners', tabBarIcon: ({ focused }) => <TabIcon label="CleanersTab" focused={focused} /> }}
    />
    <Tab.Screen name="WorkTab" component={WorkStackNavigator}
      options={{ tabBarLabel: 'Work', tabBarIcon: ({ focused }) => <TabIcon label="WorkTab" focused={focused} /> }}
    />
    <Tab.Screen name="MoreTab" component={MoreStackNavigator}
      options={{ tabBarLabel: 'More', tabBarIcon: ({ focused }) => <TabIcon label="MoreTab" focused={focused} /> }}
    />
  </Tab.Navigator>
);

export default MainTabNavigator;
