// src/context/SettingsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUserThemeFromServer,
  saveUserThemeToServer,
} from "../services/userSettings";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState("light"); // 'light' or 'dark'
  const [loadingSettings, setLoadingSettings] = useState(true);
  const { user } = useAuth();

  // Immediately load theme from local storage
  useEffect(() => {
    const loadLocalTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@theme");
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (err) {
        console.warn("Error loading local theme:", err);
      }
    };
    loadLocalTheme();
  }, []);

  // Then, if the user is logged in, fetch remote theme from Firestore
  useEffect(() => {
    const fetchRemoteTheme = async () => {
      if (user) {
        try {
          const remoteTheme = await getUserThemeFromServer();
          if (remoteTheme && remoteTheme !== theme) {
            setTheme(remoteTheme);
            await AsyncStorage.setItem("@theme", remoteTheme);
          }
        } catch (err) {
          console.warn("Error fetching remote theme:", err);
        }
      }
      setLoadingSettings(false);
    };
    fetchRemoteTheme();
  }, [user]);

  // When toggling, update both local storage and remote Firestore
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("@theme", newTheme);
      if (user) {
        await saveUserThemeToServer(newTheme);
      }
    } catch (err) {
      console.warn("Error saving theme:", err);
    }
  };

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, loadingSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
