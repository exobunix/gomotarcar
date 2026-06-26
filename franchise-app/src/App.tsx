import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';
import { store } from './redux/store';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme/colors';

const App = () => {
  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppNavigator />
    </Provider>
  );
};

export default App;
