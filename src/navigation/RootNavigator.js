// src/navigation/RootNavigator.js
import React, { useEffect, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../hooks/useAuth";
import AuthNavigator from "./AuthNavigator";
import BottomTabNavigator from "./BottomTabNavigator";
import CheckEmailVerificationScreen from "../screens/Auth/CheckEmailVerificationScreen";
import SplashScreen from "../screens/SplashScreen";
import MarketAnalysisStack from "./MarketAnalysisStack";
import { View, ActivityIndicator, Text } from "react-native";

const Stack = createStackNavigator();

// Simple component that immediately redirects based on auth state
const RefreshAuthScreen = ({ navigation }) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Don't try to navigate while auth is still loading
    if (loading) {
      console.log("RefreshAuthScreen - Auth still loading, waiting...");
      return;
    }
    
    console.log("RefreshAuthScreen - Auth state:", 
      user ? `User ${user.uid} (verified: ${user.emailVerified})` : "No user");
    
    // Navigate with a short delay
    const timer = setTimeout(() => {
      try {
        if (!user) {
          console.log("RefreshAuth - No user, navigating to Auth");
          navigation.navigate('Auth');
        } else if (!user.emailVerified) {
          console.log("RefreshAuth - User not verified, navigating to CheckEmailVerification");
          navigation.navigate('CheckEmailVerification');
        } else {
          console.log("RefreshAuth - User verified, navigating to MainTabs");
          
          // Just do a simple navigate call for verified users
          navigation.navigate('MainTabs');
        }
      } catch (err) {
        console.error("Navigation error in RefreshAuthScreen:", err);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading, navigation]);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#5D5FEF" />
      <Text style={{ marginTop: 20 }}>Refreshing navigation state...</Text>
      <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
        {user ? `User: ${user.email}` : 'No user'}
      </Text>
    </View>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();
  
  // Skip the loading state when rendering
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
    >
      {/* This is crucial! Put MainTabs and MarketAnalysisStack BEFORE the conditional logic */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="MarketAnalysisStack" component={MarketAnalysisStack} />
      
      {/* Special screen for handling auth refreshes */}
      <Stack.Screen name="RefreshAuth" component={RefreshAuthScreen} />
      
      {/* Now handle the conditional rendering */}
      {!user ? (
        // No user is signed in
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !user.emailVerified ? (
        // User is signed in but email is not verified
        <Stack.Group>
          <Stack.Screen
            name="CheckEmailVerification"
            component={CheckEmailVerificationScreen}
            options={{ gestureEnabled: false }} // Prevent going back
          />
          {/* Include Auth as a fallback in case of verification errors */}
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Group>
      ) : null /* Don't add any screens here since MainTabs is already defined above */}
    </Stack.Navigator>
  );
};

export default RootNavigator;
