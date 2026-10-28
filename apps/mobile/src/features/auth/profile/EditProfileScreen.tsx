import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../shared/theme';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (!fullName || !email) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    
    setIsLoading(true);
    // TODO: Implement actual profile update logic
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Profile updated successfully');
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
        <Text style={styles.header}>Edit Profile</Text>
        <Text style={styles.subheader}>Update your personal information</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar} />
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Bio Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d1d5db',
    marginBottom: theme.spacing.md,
  },
  changePhotoButton: {
    padding: theme.spacing.sm,
  },
  changePhotoText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.md,
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
