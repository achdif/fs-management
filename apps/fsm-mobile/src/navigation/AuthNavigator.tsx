import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PasswordResetScreen from '../screens/auth/PasswordResetScreen';
import BiometricSetupScreen from '../screens/auth/BiometricSetupScreen';
import BiometricLoginScreen from '../screens/auth/BiometricLoginScreen';

const Stack = createNativeStackNavigator();

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: {email?: string} | undefined;
  ForgotPassword: undefined;
  PasswordReset: {token?: string} | undefined;
  BiometricSetup: undefined;
  BiometricLogin: undefined;
};

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
      <Stack.Screen name="BiometricLogin" component={BiometricLoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
