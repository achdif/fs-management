import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@fs-management/auth';
import { storageService } from '../../../storage/storageService';
import { theme } from '../../../shared/theme';
import { BottomSheet } from '../../../components/BottomSheet';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading, error, errorCode, isNetworkError } = useAuth({ storage: storageService });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorSheet, setShowErrorSheet] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      // Navigate to profile or main app
      navigation.navigate('Profile' as never);
    } else {
      setShowErrorSheet(true);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const handleBiometric = () => {
    navigation.navigate('BiometricLogin' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBg}>
            <Text style={styles.logoText}>FS</Text>
          </View>
        </View>

        {/* Header */}
        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.subheader}>Sign in to continue</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        {/* Biometric Button */}
        <TouchableOpacity style={styles.biometricButton} onPress={handleBiometric}>
          <Text style={styles.biometricButtonText}>Use Biometric</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Error Bottom Sheet */}
      <BottomSheet
        visible={showErrorSheet}
        onClose={() => setShowErrorSheet(false)}
        title={isNetworkError ? "No Internet Connection" : "Something went wrong"}
        message={isNetworkError ? "Please check your internet connection and try again." : error || 'Unable to complete your request. Please check your connection and try again.'}
        errorCode={errorCode || 'ERR_UNKNOWN'}
        showIcon={true}
        iconName={isNetworkError ? "📶" : "✕"}
        iconColor={isNetworkError ? "#ff9900" : "#ff4d4d"}
        isNetworkError={isNetworkError}
        actionButton={{
          text: 'Retry',
          onPress: () => {
            setShowErrorSheet(false);
            handleLogin();
          },
        }}
        cancelButton={{
          text: 'Cancel',
          onPress: () => setShowErrorSheet(false),
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  biometricButton: {
    backgroundColor: theme.colors.white,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: theme.spacing.xl,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  signUpLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
