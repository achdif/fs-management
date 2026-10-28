import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../shared/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword' as never);
  };

  const handleBiometricSettings = () => {
    navigation.navigate('BiometricSetup' as never);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigation.navigate('Login' as never);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.header}>Profile Settings</Text>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <Text style={styles.menuItemText}>Change Password</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleBiometricSettings}>
          <Text style={styles.menuItemText}>Biometric Settings</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleLogout}>
          <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 60,
    marginBottom: 40,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d1d5db',
    marginRight: theme.spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  logoutText: {
    color: theme.colors.error,
  },
  menuItemArrow: {
    fontSize: 18,
    color: theme.colors.text.secondary,
  },
});
