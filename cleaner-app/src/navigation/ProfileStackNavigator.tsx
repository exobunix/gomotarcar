import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import ProfileScreen from '../screens/profile/ProfileScreen';
import TaskHistoryScreen from '../screens/history/TaskHistoryScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import BankDetailsScreen from '../screens/profile/BankDetailsScreen';
import DocumentsScreen from '../screens/profile/DocumentsScreen';
import PersonalInformationScreen from '../screens/profile/PersonalInformationScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="TaskHistory" component={TaskHistoryScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
    <Stack.Screen name="Documents" component={DocumentsScreen} />
    <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

export default ProfileStackNavigator;
