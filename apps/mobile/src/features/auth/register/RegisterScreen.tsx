import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@fs-management/auth';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { storageService } from '../../../storage/storageService';
import { theme } from '../../../shared/theme';
import { BottomSheet } from '../../../components/BottomSheet';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading, error, errorCode, isNetworkError } = useAuth({ storage: storageService });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showErrorSheet, setShowErrorSheet] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    const result = await register({ fullName, email, password, phone: '' });
    if (result.success) {
      // Navigate to OTP verification
      navigation.navigate('OTP', { email: result.email || email });
    } else {
      setShowErrorSheet(true);
    }
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
        {/* Header */}
        <Text style={styles.header}>Create Account</Text>
        <Text style={styles.subheader}>Sign up to get started</Text>

        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setAgreeTerms(!agreeTerms)}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>


        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })}>
            <Text style={styles.signInLink}>Sign In</Text>
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
            handleRegister();
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 60,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  termsLink: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  signInLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
