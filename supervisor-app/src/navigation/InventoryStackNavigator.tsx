import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InventoryStackParamList } from '../types/navigation';
import InventoryListScreen from '../screens/inventory/InventoryListScreen';
import InventoryDetailScreen from '../screens/inventory/InventoryDetailScreen';

const Stack = createNativeStackNavigator<InventoryStackParamList>();

const InventoryStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="InventoryList" component={InventoryListScreen} />
    <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
  </Stack.Navigator>
);

export default InventoryStackNavigator;
