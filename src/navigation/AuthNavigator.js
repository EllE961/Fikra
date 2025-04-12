// src/navigation/AuthNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginOptionsScreen from "../screens/Auth/LoginOptionsScreen";
import EmailLoginScreen from "../screens/Auth/EmailLoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginOptions" component={LoginOptionsScreen} />
      <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
