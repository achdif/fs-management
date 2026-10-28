import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@fs-management/auth';
import { storageService } from '../../../storage/storageService';
import { theme } from '../../../shared/theme';
import { BottomSheet } from '../../../components/BottomSheet';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { forgotPassword, isLoading, error, errorCode, isNetworkError } = useAuth({ storage: storageService });
  const [email, setEmail] = useState('');
  const [showErrorSheet, setShowErrorSheet] = useState(false);

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    const success = await forgotPassword(email);
    if (success) {
      Alert.alert('Success', 'Password reset link sent to your email');
      navigation.navigate('Login' as never);
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
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>←</Text>
          </View>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.header}>Forgot Password?</Text>
        <Text style={styles.subheader}>Enter your email to receive a</Text>
        <Text style={styles.subheader}>password reset link</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>


        {/* Send Reset Link Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSendResetLink}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <View style={styles.backToLoginContainer}>
          <TouchableOpacity onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Login' as never }],
          })}>
            <Text style={styles.backToLoginText}>← Back to Login</Text>
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
            handleSendResetLink();
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
  backButton: {
    marginTop: 60,
    marginBottom: 20,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#4d4d4d',
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
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
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
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginContainer: {
    marginTop: 40,
  },
  backToLoginText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
