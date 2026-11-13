import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getApiClient } from '@fs-management/auth';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalErrorSheet from './src/components/GlobalErrorSheet';
import { API_BASE_URL } from './src/config';

getApiClient({ baseUrl: API_BASE_URL });

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
