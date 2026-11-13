import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '@fs-management/auth';
import type {MainStackParamList} from '../../navigation/MainNavigator';
import {authStorageService} from '../../storage';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {changePassword, isLoading} = useAuth({
    storage: authStorageService,
  });

  const handleUpdate = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      return;
    }
    const success = await changePassword(currentPassword, newPassword);
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Update your password to keep your{`\n`}account secure
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor="#4D4D4D"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor="#4D4D4D"
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor="#4D4D4D"
            secureTextEntry
          />
        </View>

        <Text style={styles.requirementsTitle}>Password must contain:</Text>
        <Text style={styles.requirement}>✓ At least 8 characters</Text>
        <Text style={styles.requirement}>✓ One uppercase letter</Text>
        <Text style={styles.requirement}>✓ One number</Text>
        <Text style={styles.requirement}>✓ One special character</Text>



        <TouchableOpacity
          style={[styles.updateButton, isLoading && {opacity: 0.6}]}
          onPress={handleUpdate}
          disabled={isLoading}>
          <Text style={styles.updateButtonText}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  input: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1A1A1A',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginTop: 8,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    fontWeight: '400',
    color: '#3B82F5',
    marginBottom: 4,
  },
  updateButton: {
    height: 56,
    backgroundColor: '#3B82F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FF4D4D',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
});

export default ChangePasswordScreen;
