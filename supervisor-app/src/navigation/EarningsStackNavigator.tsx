import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalaryIncentivesScreen from '../screens/salary/SalaryIncentivesScreen';

const Stack = createNativeStackNavigator();

const EarningsStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EarningsMain" component={SalaryIncentivesScreen} />
  </Stack.Navigator>
);

export default EarningsStackNavigator;
