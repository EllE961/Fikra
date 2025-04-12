// src/App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { MyLightTheme, MyDarkTheme } from "./theme/AppTheme";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { LoadingProvider } from "./context/LoadingContext";
import SplashScreen from "./screens/SplashScreen";
import { navigationRef } from "./navigationRef";
import { ENV } from "./constants/env";
import { logInfo } from "./services/logger";

// Export the navigationRef for use outside of components
export { navigationRef };

const AppContent = () => {
  const { loading } = useAuth();
  if (loading) {
    return <SplashScreen />;
  }
  return (
    <LoadingProvider>
      <RootNavigator />
    </LoadingProvider>
  );
};

const AppNavigator = () => {
  const { theme } = useSettings();
  const navTheme = theme === "light" ? MyLightTheme : MyDarkTheme;
  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <AppContent />
    </NavigationContainer>
  );
};

const App = () => {
  useEffect(() => {
    logInfo(
      `Fikra started in ${ENV.ENV_NAME} mode. Base URL: ${ENV.API_BASE_URL}`
    );
  }, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        <AppNavigator />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
