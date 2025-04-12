// src/navigation/ProfileNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import AvatarDetailScreen from '../screens/Profile/AvatarDetailScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import AccountSettingsScreen from '../screens/Settings/AccountSettingsScreen';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Profile">
      {/* Profile Flow */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />

      {/* Settings Flow */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account Settings' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
