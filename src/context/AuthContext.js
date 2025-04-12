import React, {createContext, useState, useEffect, useContext} from 'react';
import {auth} from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'user';

// Direct user session management functions
export const setUserSession = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      console.log("User session started");
    }
  } catch (error) {
    console.error("Error in setUserSession: ", error);
  }
};

export const getUserSession = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    const user = userData ? JSON.parse(userData) : null;
    if (user) {
      console.log("User session ongoing: ", user.uid);
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error in getUserSession: ", error);
    return null;
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    console.log("User session cleared");
  } catch (error) {
    console.error("Error clearing user session: ", error);
  }
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user session on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // First try to get user from AsyncStorage
        const storedUser = await getUserSession();
        if (storedUser) {
          console.log("Found stored user, restoring session");
          setUser(storedUser);
        }
        
        // Then listen for Firebase auth changes
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
          if (currentUser) {
            console.log("Firebase auth changed, user logged in");
            setUser(currentUser);
            setUserSession(currentUser);
          } else if (!storedUser) {
            // If Firebase says no user and we didn't find one in storage
            console.log("No user found in Firebase auth");
            setUser(null);
            clearUserSession();
          }
          setLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading auth state:', error);
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Logout function that clears everything
  const logout = async () => {
    try {
      // Clear local session first
      await clearUserSession();
      
      // Then sign out from Firebase
      await signOut(auth);
      
      // Clear any potential cached user data in the React state
      setUser(null);
      
      // Add a short delay to ensure all async operations complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("User successfully logged out and session cleared");
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Force clear user in case of error
      setUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
