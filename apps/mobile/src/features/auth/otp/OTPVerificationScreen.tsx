import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '@fs-management/auth';
import { storageService } from '../../../storage/storageService';
import { theme } from '../../../shared/theme';
import { BottomSheet } from '../../../components/BottomSheet';

type RouteParams = {
  OTP: { email: string };
};

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'OTP'>>();
  const { email } = route.params;

  const { verifyOTP, isLoading, error, errorCode, isNetworkError } = useAuth({ storage: storageService });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [showErrorSheet, setShowErrorSheet] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      // Auto-focus next input
      // In a real implementation, you'd use refs for this
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    const success = await verifyOTP(email, otpValue);
    if (success) {
      // Navigate to profile or main app
      navigation.navigate('Profile' as never);
    } else {
      setShowErrorSheet(true);
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(300);
      // TODO: Implement resend OTP logic
      Alert.alert('Success', 'New OTP sent');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <Text style={styles.header}>Verify Email</Text>
        <Text style={styles.subheader}>We sent a code to</Text>
        <Text style={styles.email}>{email}</Text>

        {/* OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(index, value)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>


        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Code expires in {formatTime(timer)}</Text>
        </View>

        {/* Resend Link */}
        {timer === 0 && (
          <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>
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
            handleVerify();
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
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  otpInput: {
    width: 50,
    height: 56,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timerText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
  },
  resendText: {
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
