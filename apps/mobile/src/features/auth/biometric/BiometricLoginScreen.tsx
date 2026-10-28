import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../shared/theme';

export default function BiometricLoginScreen() {
  const navigation = useNavigation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    // TODO: Implement actual biometric authentication logic
    setTimeout(() => {
      setIsAuthenticating(false);
      Alert.alert('Success', 'Biometric authentication successful');
      // Navigate to profile or main app
    }, 1000);
  };

  const handleUsePassword = () => {
    navigation.navigate('Login' as never);
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
        <Text style={styles.header}>Biometric Login</Text>
        <Text style={styles.subheader}>Use your biometric to sign in</Text>

        {/* Fingerprint Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.fingerprintIcon} />
        </View>

        {/* Status Text */}
        <Text style={styles.statusText}>
          {isAuthenticating ? 'Authenticating...' : 'Touch the fingerprint sensor'}
        </Text>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john.doe@example.com</Text>
          </View>
        </View>

        {/* Use Password Link */}
        <View style={styles.usePasswordContainer}>
          <TouchableOpacity onPress={handleUsePassword}>
            <Text style={styles.usePasswordText}>Use password instead</Text>
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
    marginBottom: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  fingerprintIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 40,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d1d5db',
    marginRight: theme.spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  usePasswordContainer: {
    alignItems: 'center',
  },
  usePasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
