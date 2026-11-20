import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileSettingsScreen from '../screens/profile/ProfileSettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import OpportunitiesListScreen from '../screens/prebook/OpportunitiesListScreen';
import OpportunityDetailScreen from '../screens/prebook/OpportunityDetailScreen';
import FollowUpHistoryScreen from '../screens/prebook/FollowUpHistoryScreen';
import ScheduleFollowUpScreen from '../screens/prebook/ScheduleFollowUpScreen';
import LogFollowUpScreen from '../screens/prebook/LogFollowUpScreen';
import ConvertToBookingScreen from '../screens/prebook/ConvertToBookingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export type MainStackParamList = {
  HomeTabs: undefined;
  ProfileSettings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  OpportunityDetail: { preBookId: string };
  FollowUpHistory: { preBookId: string };
  ScheduleFollowUp: { preBookId: string };
  LogFollowUp: { preBookId: string; followUpId?: string };
  ConvertToBooking: { preBookId: string };
};

const HomeTabs = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Pipeline" component={OpportunitiesListScreen} />
      {/* TODO: Add Search, Tasks, Profile tabs */}
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
      <Stack.Screen name="FollowUpHistory" component={FollowUpHistoryScreen} />
      <Stack.Screen name="ScheduleFollowUp" component={ScheduleFollowUpScreen} />
      <Stack.Screen name="LogFollowUp" component={LogFollowUpScreen} />
      <Stack.Screen name="ConvertToBooking" component={ConvertToBookingScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
