import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './theme/colors';

LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

const AppContent = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
      />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
