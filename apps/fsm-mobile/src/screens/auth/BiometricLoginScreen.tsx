import React, {useEffect, useState} from 'react';
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
import {useAuth, useAuthStore} from '@fs-management/auth';
import type {AuthStackParamList} from '../../navigation/AuthNavigator';
import {authStorageService} from '../../storage';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

const BiometricLoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const user = useAuthStore(state => state.user);
  const setAuthError = useAuthStore(state => state.setError);
  const setRetryAction = useAuthStore(state => state.setRetryAction);
  const {checkAuth} = useAuth({storage: authStorageService});
  const [isLoading, setIsLoading] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [flag, availability] = await Promise.all([
          NativeSecureStorage.getItem(BIOMETRIC_ENABLED_KEY),
          NativeBiometricAuth.isAvailable(),
        ]);
        setAvailable(flag === 'true' && availability.available);
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  const handleBiometric = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    setRetryAction(null);
    try {
      const result = await NativeBiometricAuth.authenticate(
        'Sign in with biometric',
      );
      if (!result.success) {
        const message = result.error ?? 'Biometric authentication failed';
        setAuthError(message, null, false, 'biometricLogin');
        setRetryAction(() => () => { void handleBiometric(); });
        return;
      }
      await checkAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Biometric login failed';
      setAuthError(message, null, false, 'biometricLogin');
      setRetryAction(() => () => { void handleBiometric(); });
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

      <Text style={styles.title}>Biometric Login</Text>
      <Text style={styles.subtitle}>Use your biometric to sign in</Text>

      {!available ? (
        <Text style={styles.errorText}>
          Biometric login is not set up on this device.
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.fingerprintContainer}
        onPress={handleBiometric}
        disabled={isLoading || !available}>
        <View style={styles.fingerprintOuter}>
          <View style={styles.fingerprintInner}>
            <Text style={styles.fingerprintEmoji}>👆</Text>
          </View>
        </View>
      </TouchableOpacity>
      <Text style={styles.fingerprintHint}>
        {isLoading ? 'Authenticating...' : 'Touch the sensor'}
      </Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.fullName || user?.email || 'U')
              .split(' ')
              .map(part => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.fullName || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.passwordLink}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.passwordLinkText}>Use password instead</Text>
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
    flexGrow: 1,
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintEmoji: {
    fontSize: 48,
  },
  fingerprintHint: {
    fontSize: 16,
    fontWeight: '500',
    color: '#808080',
    textAlign: 'center',
    marginBottom: 32,
  },
  userCard: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '400',
    color: '#808080',
    marginTop: 2,
  },
  passwordLink: {
    alignSelf: 'center',
    marginTop: 'auto',
    paddingTop: 24,
  },
  passwordLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F5',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FF4D4D',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default BiometricLoginScreen;
