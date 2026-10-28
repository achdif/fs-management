import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../shared/theme';

export default function BiometricSetupScreen() {
  const navigation = useNavigation();
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [touchIdEnabled, setTouchIdEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableBiometric = async () => {
    if (!faceIdEnabled && !touchIdEnabled) {
      Alert.alert('Error', 'Please select at least one biometric option');
      return;
    }
    
    setIsLoading(true);
    // TODO: Implement actual biometric setup logic
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Biometric authentication enabled');
      navigation.navigate('Login' as never);
    }, 1000);
  };

  const handleSkip = () => {
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
        <Text style={styles.header}>Biometric Setup</Text>
        <Text style={styles.subheader}>Enable biometric authentication for quick access</Text>

        {/* Fingerprint Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.fingerprintIcon} />
        </View>

        {/* Face ID Option */}
        <View style={styles.optionContainer}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Face ID</Text>
            <Text style={styles.optionDescription}>Use your face to sign in</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, faceIdEnabled && styles.toggleEnabled]}
            onPress={() => setFaceIdEnabled(!faceIdEnabled)}
          >
            <View style={[styles.toggleCircle, faceIdEnabled && styles.toggleCircleEnabled]} />
          </TouchableOpacity>
        </View>

        {/* Touch ID Option */}
        <View style={styles.optionContainer}>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Touch ID</Text>
            <Text style={styles.optionDescription}>Use your fingerprint to sign in</Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggle, touchIdEnabled && styles.toggleEnabled]}
            onPress={() => setTouchIdEnabled(!touchIdEnabled)}
          >
            <View style={[styles.toggleCircle, touchIdEnabled && styles.toggleCircleEnabled]} />
          </TouchableOpacity>
        </View>

        {/* Enable Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleEnableBiometric}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Enabling...' : 'Enable Biometric'}</Text>
        </TouchableOpacity>

        {/* Skip Link */}
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  fingerprintIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: theme.colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
  },
  toggleCircleEnabled: {
    marginLeft: 20,
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
  skipContainer: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
