import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EarningsStackParamList } from '../types/navigation';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import IncentivesScreen from '../screens/earnings/IncentivesScreen';
import LeaderboardScreen from '../screens/earnings/LeaderboardScreen';
import EarningsHistoryScreen from '../screens/history/EarningsHistoryScreen';

const Stack = createNativeStackNavigator<EarningsStackParamList>();

const EarningsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EarningsMain" component={EarningsScreen} />
    <Stack.Screen name="Incentives" component={IncentivesScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Stack.Screen name="EarningsHistory" component={EarningsHistoryScreen} />
  </Stack.Navigator>
);

export default EarningsStackNavigator;
