import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import DashboardStackNavigator from './DashboardStackNavigator';
import ApartmentStackNavigator from './ApartmentStackNavigator';
import CleanerStackNavigator from './CleanerStackNavigator';
import TodayCleaningStackNavigator from './TodayCleaningStackNavigator';
import AttendanceStackNavigator from './AttendanceStackNavigator';
import WorkStackNavigator from './WorkStackNavigator';
import InventoryStackNavigator from './InventoryStackNavigator';
import GrievanceStackNavigator from './GrievanceStackNavigator';
import NotificationStackNavigator from './NotificationStackNavigator';
import ReportsStackNavigator from './ReportsStackNavigator';
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
        tabBarIcon: ({ color }) => <Icon name="home-outline" color={color} size={24} /> 
      }}
    />
    <Tab.Screen 
      name="ApartmentsTab" 
      component={ApartmentStackNavigator}
      options={{ 
        tabBarLabel: 'Apartments', 
        tabBarIcon: ({ color }) => <Icon name="office-building" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="CleanersTab" 
      component={CleanerStackNavigator}
      options={{ 
        tabBarLabel: 'Cleaners', 
        tabBarIcon: ({ color }) => <Icon name="account-multiple-outline" color={color} size={24} /> 
      }}
    />
    <Tab.Screen 
      name="TodayCleaningTab" 
      component={TodayCleaningStackNavigator}
      options={{ 
        tabBarLabel: "Today's Cleaning", 
        tabBarIcon: ({ color }) => <Icon name="steering" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="AttendanceTab" 
      component={AttendanceStackNavigator}
      options={{ 
        tabBarLabel: 'Attendance', 
        tabBarIcon: ({ color }) => <Icon name="calendar-check-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="ApprovalsTab" 
      component={WorkStackNavigator}
      options={{ 
        tabBarLabel: 'Approvals', 
        tabBarIcon: ({ color }) => <Icon name="clipboard-check-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="InventoryTab" 
      component={InventoryStackNavigator}
      options={{ 
        tabBarLabel: 'Inventory', 
        tabBarIcon: ({ color }) => <Icon name="cube-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="ComplaintsTab" 
      component={GrievanceStackNavigator}
      options={{ 
        tabBarLabel: 'Complaints', 
        tabBarIcon: ({ color }) => <Icon name="message-text-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="NotificationsTab" 
      component={NotificationStackNavigator}
      options={{ 
        tabBarLabel: 'Notifications', 
        tabBarIcon: ({ color }) => (
          <View style={{ position: 'relative' }}>
            <Icon name="bell-outline" color={color} size={22} />
            <View style={{
              position: 'absolute',
              top: -2,
              right: -4,
              backgroundColor: '#EF4444',
              borderRadius: 6,
              minWidth: 12,
              height: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 7, fontWeight: '800', color: '#FFFFFF' }}>12</Text>
            </View>
          </View>
        )
      }}
    />
    <Tab.Screen 
      name="ReportsTab" 
      component={ReportsStackNavigator}
      options={{ 
        tabBarLabel: 'Reports', 
        tabBarIcon: ({ color }) => <Icon name="chart-box-outline" color={color} size={22} /> 
      }}
    />
    <Tab.Screen 
      name="MoreTab" 
      component={MoreStackNavigator}
      options={{ 
        tabBarLabel: 'More', 
        tabBarIcon: ({ color }) => <Icon name="dots-horizontal" color={color} size={24} /> 
      }}
    />
  </Tab.Navigator>
);

export default MainTabNavigator;
