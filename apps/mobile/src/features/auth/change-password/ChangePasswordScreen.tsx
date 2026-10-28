import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../shared/theme';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
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
    
    setIsLoading(true);
    // TODO: Implement actual change password logic
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Password changed successfully');
      navigation.goBack();
    }, 1000);
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
        <Text style={styles.header}>Change Password</Text>
        <Text style={styles.subheader}>Update your password to keep your account secure</Text>

        {/* Current Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
        </View>

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
          <Text style={styles.inputLabel}>Confirm New Password</Text>
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

        {/* Update Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>

        {/* Cancel Link */}
        <View style={styles.cancelContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  cancelContainer: {
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
