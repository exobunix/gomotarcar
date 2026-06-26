import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Text } from 'react-native';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ApprovalsScreen from '../screens/approvals/ApprovalsScreen';
import SupportScreen from '../screens/support/SupportScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, color: focused ? '#0D5BD7' : '#888' }}>{name}</Text>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0D5BD7' }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} /> }} />
    <Tab.Screen name="Approvals" component={ApprovalsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="✅" focused={focused} /> }} />
    <Tab.Screen name="Support" component={SupportScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="🎫" focused={focused} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} /> }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const token = useSelector((state: any) => state.auth?.token);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? <Stack.Screen name="Main" component={MainTabs} /> : <Stack.Screen name="Login" component={LoginScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
