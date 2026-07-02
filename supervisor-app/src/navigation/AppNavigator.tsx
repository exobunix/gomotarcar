import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { RootState, AppDispatch } from '../redux/store';
import { restoreSession, loadProfile } from '../redux/slices/authSlice';
import { colors } from '../theme/colors';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SplashScreen from '../screens/auth/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppState = 'loading' | 'onboarding' | 'auth' | 'main';

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [appState, setAppState] = useState<AppState>('loading');

  useEffect(() => {
    const init = async () => {
      // Check if onboarding has been seen before
      const onboardingDone = await AsyncStorage.getItem('onboardingDone');

      // Restore session
      const action = await dispatch(restoreSession());
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(loadProfile());
      }

      if (!onboardingDone) {
        // First launch — show onboarding
        setAppState('onboarding');
      } else if (action.meta.requestStatus === 'fulfilled') {
        setAppState('main');
      } else {
        setAppState('auth');
      }
    };
    init();
  }, [dispatch]);

  // Re-evaluate when auth state changes (e.g. after login/logout)
  useEffect(() => {
    if (appState === 'loading' || appState === 'onboarding') return;
    setAppState(isAuthenticated ? 'main' : 'auth');
  }, [isAuthenticated]);

  if (appState === 'loading') {
    return <SplashScreen />;
  }

  if (appState === 'onboarding') {
    return (
      <OnboardingScreen
        onDone={() => setAppState(isAuthenticated ? 'main' : 'auth')}
      />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;
