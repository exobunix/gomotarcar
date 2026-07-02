import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './redux/store';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { colors } from './theme/colors';

const App: React.FC = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
          <AppNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  </Provider>
);

export default App;
