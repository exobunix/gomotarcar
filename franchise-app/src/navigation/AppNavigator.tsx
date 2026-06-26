import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Text } from 'react-native';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import StaffScreen from '../screens/staff/StaffScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => (
  <Text style={{ fontSize: 20, color: focused ? '#0D5BD7' : '#888' }}>{name}</Text>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0D5BD7', tabBarInactiveTintColor: '#888' }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} /> }} />
    <Tab.Screen name="Bookings" component={BookingsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="📅" focused={focused} /> }} />
    <Tab.Screen name="Staff" component={StaffScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="👥" focused={focused} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} /> }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const token = useSelector((state) => state.auth?.token);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
