import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import store from './redux/store';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme/colors';

const App: React.FC = () => (
  <Provider store={store}>
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <AppNavigator />
    </NavigationContainer>
  </Provider>
);

export default App;
