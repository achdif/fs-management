import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// Screens (to be implemented)
import LoginScreen from '../features/auth/login/LoginScreen';
import RegisterScreen from '../features/auth/register/RegisterScreen';
import OTPVerificationScreen from '../features/auth/otp/OTPVerificationScreen';
import ForgotPasswordScreen from '../features/auth/forgot-password/ForgotPasswordScreen';
import ResetPasswordScreen from '../features/auth/reset-password/ResetPasswordScreen';
import ChangePasswordScreen from '../features/auth/change-password/ChangePasswordScreen';
import BiometricSetupScreen from '../features/auth/biometric/BiometricSetupScreen';
import BiometricLoginScreen from '../features/auth/biometric/BiometricLoginScreen';
import ProfileScreen from '../features/auth/profile/ProfileScreen';
import EditProfileScreen from '../features/auth/profile/EditProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: { email: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  ChangePassword: undefined;
  BiometricSetup: undefined;
  BiometricLogin: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="OTP" component={OTPVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} />
        <Stack.Screen name="BiometricLogin" component={BiometricLoginScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
