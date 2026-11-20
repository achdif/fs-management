import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {useAuth, useAuthStore} from '@fs-management/auth';
import {getPreBookApiClient} from '@fs-management/prebook';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {authStorageService} from '../storage';

const AppNavigator = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [ready, setReady] = useState(false);
  const {checkAuth} = useAuth({storage: authStorageService});

  useEffect(() => {
    checkAuth().finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan token auth ke prebook API client (bearer mode).
  // Cookie mode (web): setToken no-op, cookie backend yang handle.
  useEffect(() => {
    const syncToken = async () => {
      const token = isAuthenticated ? await authStorageService.getAccessToken() : null;
      getPreBookApiClient().setToken(token);
    };
    void syncToken();
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" color="#3B82F5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
