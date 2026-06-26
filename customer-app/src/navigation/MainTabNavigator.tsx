import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, ProfileStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

// Stacks
import HomeStackNavigator from './HomeStackNavigator';
import BookingsStackNavigator from './BookingsStackNavigator';
import ServicesStackNavigator from './ServicesStackNavigator';
import NotificationsStackNavigator from './NotificationsStackNavigator';

// Profile screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import VehiclesScreen from '../screens/vehicles/VehiclesScreen';
import AddVehicleScreen from '../screens/vehicles/AddVehicleScreen';
import ApartmentsScreen from '../screens/apartments/ApartmentsScreen';
import AddApartmentScreen from '../screens/apartments/AddApartmentScreen';
import MyReviewsScreen from '../screens/reviews/MyReviewsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => {
  const icons: Record<string, string> = {
    Home: '🏠',
    Services: '🔧',
    BookingsTab: '📋',
    Alerts: '🔔',
    Profile: '👤',
  };

  return (
    <View style={tabIconStyles.container}>
      <Text style={[tabIconStyles.icon, focused && tabIconStyles.focused]}>
        {icons[label] || '•'}
      </Text>
    </View>
  );
};

const tabIconStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22, opacity: 0.5 },
  focused: { opacity: 1 },
});

const ProfileNavigator: React.FC = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="MyVehicles" component={VehiclesScreen} />
    <ProfileStack.Screen name="AddVehicle" component={AddVehicleScreen} />
    <ProfileStack.Screen name="MyApartments" component={ApartmentsScreen} />
    <ProfileStack.Screen name="AddApartment" component={AddApartmentScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="MyReviews" component={MyReviewsScreen} />
  </ProfileStack.Navigator>
);

const MainTabNavigator: React.FC = () => {
  return (
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
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStackNavigator}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) => <TabIcon label="BookingsTab" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesStackNavigator}
        options={{
          tabBarLabel: 'Services',
          tabBarIcon: ({ focused }) => <TabIcon label="Services" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationsStackNavigator}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon label="Alerts" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
