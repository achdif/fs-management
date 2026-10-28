import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '@fs-management/auth';
import { storageService } from '../../../storage/storageService';
import { theme } from '../../../shared/theme';
import { BottomSheet } from '../../../components/BottomSheet';

type RouteParams = {
  ResetPassword: { token: string };
};

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ResetPassword'>>();
  const { token } = route.params;

  const { resetPassword, isLoading, error, errorCode, isNetworkError } = useAuth({ storage: storageService });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showErrorSheet, setShowErrorSheet] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    const success = await resetPassword(token, newPassword);
    if (success) {
      Alert.alert('Success', 'Password reset successful');
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
        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.subheader}>Create a new secure password</Text>

        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>


        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password must:</Text>
          <Text style={styles.requirement}>• Be at least 8 characters</Text>
          <Text style={styles.requirement}>• Include uppercase and lowercase</Text>
          <Text style={styles.requirement}>• Include a number</Text>
          <Text style={styles.requirement}>• Include a special character</Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <View style={styles.backToLoginContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
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
            handleResetPassword();
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
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  requirementsContainer: {
    marginBottom: theme.spacing.xl,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 4,
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
  backToLoginContainer: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
