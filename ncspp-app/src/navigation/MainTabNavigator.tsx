import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import DashboardStackNavigator from './DashboardStackNavigator';
import ServicesStackNavigator from './ServicesStackNavigator';
import LeadsStackNavigator from './LeadsStackNavigator';
import WalletStackNavigator from './WalletStackNavigator';
import MoreStackNavigator from './MoreStackNavigator';
import { colors } from '../theme/colors';

export type MainTabParamList = {
  DashboardTab: undefined;
  ServicesTab: undefined;
  LeadsTab: undefined;
  WalletTab: undefined;
  MoreTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Services: '🛠',
    Leads: '📋',
    Wallet: '💳',
    More: '⚙️',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[label] || '📌'}
      </Text>
    </View>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStackNavigator}
        options={{
          tabBarLabel: 'Services',
          tabBarIcon: ({ focused }) => <TabIcon label="Services" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LeadsTab"
        component={LeadsStackNavigator}
        options={{
          tabBarLabel: 'Leads',
          tabBarIcon: ({ focused }) => <TabIcon label="Leads" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletStackNavigator}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ focused }) => <TabIcon label="Wallet" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ focused }) => <TabIcon label="More" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});

export default MainTabNavigator;
