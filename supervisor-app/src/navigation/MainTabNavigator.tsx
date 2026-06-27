import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import DashboardStackNavigator from './DashboardStackNavigator';
import ApartmentStackNavigator from './ApartmentStackNavigator';
import CleanerStackNavigator from './CleanerStackNavigator';
import AttendanceStackNavigator from './AttendanceStackNavigator';
import WorkStackNavigator from './WorkStackNavigator';
import MoreStackNavigator from './MoreStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E2E8F0',
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 10,
        paddingTop: 8,
      },
      tabBarLabelStyle: { fontSize: 10, fontFamily: 'Inter-Medium', fontWeight: '600' },
    }}
  >
    <Tab.Screen 
      name="DashboardTab" 
      component={DashboardStackNavigator}
      options={{ 
        tabBarLabel: 'Dashboard', 
        tabBarIcon: ({ color, size }) => <Icon name="home-outline" color={color} size={24} /> 
      }}
    />
    <Tab.Screen 
      name="ApartmentsTab" 
      component={ApartmentStackNavigator}
      options={{ 
        tabBarLabel: 'Apartments', 
        tabBarIcon: ({ color, size }) => <Icon name="office-building" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="CleanersTab" 
      component={CleanerStackNavigator}
      options={{ 
        tabBarLabel: 'Cleaners', 
        tabBarIcon: ({ color, size }) => <Icon name="account-multiple-outline" color={color} size={24} /> 
      }}
    />
    <Tab.Screen 
      name="AttendanceTab" 
      component={AttendanceStackNavigator}
      options={{ 
        tabBarLabel: 'Attendance', 
        tabBarIcon: ({ color, size }) => <Icon name="calendar-check-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="ApprovalsTab" 
      component={WorkStackNavigator}
      options={{ 
        tabBarLabel: 'Approvals', 
        tabBarIcon: ({ color, size }) => <Icon name="clipboard-check-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="MoreTab" 
      component={MoreStackNavigator}
      options={{ 
        tabBarLabel: 'More', 
        tabBarIcon: ({ color, size }) => <Icon name="dots-horizontal" color={color} size={24} /> 
      }}
    />
  </Tab.Navigator>
);

export default MainTabNavigator;
