import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WalletScreen from '../screens/wallet/WalletScreen';
import PaymentHistoryScreen from '../screens/wallet/PaymentHistoryScreen';
import { colors } from '../theme/colors';

export type WalletStackParamList = {
  Wallet: undefined;
  PaymentHistory: undefined;
};

const Stack = createNativeStackNavigator<WalletStackParamList>();

const WalletStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Wallet" component={WalletScreen}
        options={{ title: 'Wallet' }} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen}
        options={{ title: 'Payment History' }} />
    </Stack.Navigator>
  );
};

export default WalletStackNavigator;
