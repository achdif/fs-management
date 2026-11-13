import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {NativeSecureStorage} from '@fs-management/shared';
import NativeBiometricAuth from '@fs-management/auth/src/native/NativeBiometricAuth';
import {useAuthStore} from '@fs-management/auth';
import type {AuthStackParamList} from '../../navigation/AuthNavigator';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

const BiometricSetupScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [touchIdEnabled, setTouchIdEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setAuthError = useAuthStore(state => state.setError);
  const setRetryAction = useAuthStore(state => state.setRetryAction);

  const handleEnable = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    setRetryAction(null);
    const fail = (message: string) => {
      setAuthError(message, null, false, 'biometricSetup');
      setRetryAction(() => () => { void handleEnable(); });
    };
    try {
      const availability = await NativeBiometricAuth.isAvailable();
      if (!availability.available) {
        fail('Biometric is not available on this device');
        return;
      }
      const result = await NativeBiometricAuth.authenticate(
        'Enable biometric login',
      );
      if (!result.success) {
        fail(result.error ?? 'Biometric authentication failed');
        return;
      }
      await NativeSecureStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      navigation.navigate('Login');
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Biometric setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Setup Biometric</Text>
      <Text style={styles.subtitle}>
        Enable biometric authentication for{`\n`}faster login
      </Text>

      <View style={styles.fingerprintContainer}>
        <View style={styles.fingerprintOuter}>
          <View style={styles.fingerprintInner}>
            <Text style={styles.fingerprintEmoji}>👆</Text>
          </View>
        </View>
      </View>
      <Text style={styles.fingerprintHint}>
        Place your finger on the sensor
      </Text>

      <View style={styles.optionCard}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>◉</Text>
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Face ID</Text>
          <Text style={styles.optionSubtitle}>Use your face to sign in</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, faceIdEnabled && styles.toggleOn]}
          onPress={() => setFaceIdEnabled(v => !v)}>
          <View
            style={[
              styles.toggleCircle,
              faceIdEnabled && styles.toggleCircleOn,
            ]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.optionCard}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>◎</Text>
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Touch ID</Text>
          <Text style={styles.optionSubtitle}>
            Use your fingerprint to sign in
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, touchIdEnabled && styles.toggleOn]}
          onPress={() => setTouchIdEnabled(v => !v)}>
          <View
            style={[
              styles.toggleCircle,
              touchIdEnabled && styles.toggleCircleOn,
            ]}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.enableButton, isLoading && {opacity: 0.6}]}
        onPress={handleEnable}
        disabled={isLoading}>
        <Text style={styles.enableButtonText}>
          {isLoading ? 'Verifying...' : 'Enable Biometric'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  backArrow: {
    fontSize: 24,
    color: '#4D4D4D',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
    marginBottom: 36,
  },
  fingerprintContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  fingerprintOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintEmoji: {
    fontSize: 32,
  },
  fingerprintHint: {
    fontSize: 13,
    fontWeight: '400',
    color: '#808080',
    textAlign: 'center',
    marginBottom: 28,
  },
  optionCard: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#808080',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: '#3B82F5',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleOn: {
    alignSelf: 'flex-end',
  },
  enableButton: {
    height: 56,
    backgroundColor: '#3B82F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  enableButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FF4D4D',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default BiometricSetupScreen;
