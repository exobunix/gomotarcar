import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegistrationScreen from '../screens/auth/RegistrationScreen';
import GSTVerificationScreen from '../screens/auth/GSTVerificationScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  GstVerification: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegistrationScreen} />
      <Stack.Screen name="GstVerification" component={GSTVerificationScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
