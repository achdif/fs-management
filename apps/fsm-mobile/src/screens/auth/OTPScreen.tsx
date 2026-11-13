import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {useAuth} from '@fs-management/auth';
import type {AuthStackParamList} from '../../navigation/AuthNavigator';
import {authStorageService} from '../../storage';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 150;

const OTPScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<NativeStackScreenProps<AuthStackParamList, 'OTP'>['route']>();
  const email = route.params?.email ?? '';
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const {verifyOTP, isLoading} = useAuth({storage: authStorageService});
  const inputsRef = useRef<Array<React.ComponentRef<typeof TextInput> | null>>(
    [],
  );

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, OTP_LENGTH).split('');
      setDigits(prev => {
        const next = [...prev];
        pasted.forEach((d, i) => {
          if (index + i < OTP_LENGTH) {
            next[index + i] = d;
          }
        });
        return next;
      });
      const nextIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }
    setDigits(prev => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const canResend = secondsLeft <= 0;

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length === OTP_LENGTH && email) {
      const success = await verifyOTP(email, code);
      if (success) {
        navigation.navigate('Login');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
      <Text style={styles.email}>{email || 'your@email.com'}</Text>

      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              inputsRef.current[index] = ref;
            }}
            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={({nativeEvent}) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            selectTextOnFocus
          />
        ))}
      </View>

      {canResend ? (
        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.timerText}>
          Resend code in {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
      )}



      <TouchableOpacity
        style={[styles.verifyButton, isLoading && {opacity: 0.6}]}
        onPress={handleVerify}
        disabled={isLoading}>
        <Text style={styles.verifyButtonText}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
    paddingHorizontal: 24,
    paddingTop: 60,
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
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F5',
    marginBottom: 36,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  otpInputFilled: {
    borderWidth: 1,
    borderColor: '#3B82F5',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#808080',
    marginBottom: 8,
  },
  resendButton: {
    marginBottom: 8,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F5',
  },
  verifyButton: {
    height: 56,
    backgroundColor: '#3B82F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FF4D4D',
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default OTPScreen;
