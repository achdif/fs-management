import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalErrorSheet from './src/components/GlobalErrorSheet';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
      <GlobalErrorSheet />
    </SafeAreaProvider>
  );
}

export default App;
