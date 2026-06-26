import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation';
import HomeScreen from '../screens/home/HomeScreen';
import SubscriptionsScreen from '../screens/subscriptions/SubscriptionsScreen';
import SubscriptionCheckoutScreen from '../screens/subscriptions/SubscriptionCheckoutScreen';
import ApartmentVehicleSelectionScreen from '../screens/hire-cleaner/ApartmentVehicleSelectionScreen';
import PackageSelectionScreen from '../screens/hire-cleaner/PackageSelectionScreen';
import CheckoutScreen from '../screens/hire-cleaner/CheckoutScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import QRListScreen from '../screens/qr/QRListScreen';
import ServiceHistoryScreen from '../screens/history/ServiceHistoryScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
    <Stack.Screen name="SubscriptionCheckout" component={SubscriptionCheckoutScreen} />
    <Stack.Screen name="HireCleaner" component={ApartmentVehicleSelectionScreen} />
    <Stack.Screen name="HirePackageSelect" component={PackageSelectionScreen} />
    <Stack.Screen name="HireCheckout" component={CheckoutScreen} />
    <Stack.Screen name="Wallet" component={WalletScreen} />
    <Stack.Screen name="QRList" component={QRListScreen} />
    <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
  </Stack.Navigator>
);

export default HomeStackNavigator;
