import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth, useAuthStore} from '@fs-management/auth';
import type {MainStackParamList} from '../../navigation/MainNavigator';
import {authStorageService} from '../../storage';

const getInitials = (name?: string, email?: string) => {
  const source = name || email || 'U';
  return source
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const ProfileSettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAuthStore(state => state.user);
  const {logout, isLoading} = useAuth({storage: authStorageService});

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user?.fullName, user?.email)}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email ?? ''}</Text>
      </View>

      <Text style={styles.sectionTitle}>Account Settings</Text>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => navigation.navigate('EditProfile')}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>✎</Text>
        </View>
        <Text style={styles.optionText}>Edit Profile</Text>
        <Text style={styles.optionChevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => navigation.navigate('ChangePassword')}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>🔒</Text>
        </View>
        <Text style={styles.optionText}>Change Password</Text>
        <Text style={styles.optionChevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionCard}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>◉</Text>
        </View>
        <Text style={styles.optionText}>Biometric Settings</Text>
        <Text style={styles.optionChevron}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logoutButton, isLoading && {opacity: 0.6}]}
        onPress={handleLogout}
        disabled={isLoading}>
        <Text style={styles.logoutText}>
          {isLoading ? 'Logging out...' : 'Log Out'}
        </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
    color: '#808080',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 12,
  },
  optionCard: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionChevron: {
    fontSize: 20,
    color: '#666666',
  },
  logoutButton: {
    height: 56,
    backgroundColor: '#FF4D4D',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileSettingsScreen;
