import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useAuthStore} from '@fs-management/auth';

const HomeScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<any>>();
  const user = useAuthStore(state => state.user);

  const actions = [
    {icon: '📊', label: 'Dashboard'},
    {icon: '📅', label: 'Schedule'},
    {icon: '⚙️', label: 'Settings'},
  ];

  const activities = [
    {icon: '📝', title: 'New document created', time: '2 hours ago'},
    {icon: '📋', title: 'Task assigned to you', time: '5 hours ago'},
  ];

  const tabs = [
    {icon: '🏠', label: 'Home', active: true},
    {icon: '🔍', label: 'Search', active: false},
    {icon: '📋', label: 'Tasks', active: false},
    {icon: '👤', label: 'Profile', active: false},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        <View style={styles.headerText}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>
            {user?.fullName || user?.email || 'User'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map(action => (
            <TouchableOpacity key={action.label} style={styles.actionCard}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activities.map(activity => (
          <View key={activity.title} style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <Text style={styles.activityIcon}>{activity.icon}</Text>
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.label}
            style={styles.navItem}
            onPress={() => {
              if (tab.label === 'Profile') {
                navigation.navigate('ProfileSettings' as never);
              }
            }}>
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                tab.active && styles.navLabelActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
  },
  header: {
    height: 80,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: 95,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
  activityCard: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    marginTop: 2,
  },
  bottomNav: {
    height: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: '#666666',
  },
  navLabelActive: {
    color: '#3B82F6',
  },
});

export default HomeScreen;
