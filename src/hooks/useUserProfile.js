// src/hooks/useUserProfile.js
import { useState, useEffect, useRef } from 'react';
import { firestore } from '../services/firebase'; // your Firestore reference
import { useAuth } from './useAuth'; // or however you get the current user
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_STORAGE_KEY = '@userProfile';

export const useUserProfile = () => {
  const { user } = useAuth(); // the currently logged in user
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const hasFetchedRef = useRef(false);

  // Load user profile from AsyncStorage first, then update from Firestore
  useEffect(() => {
    let unsubscribe;
    
    const loadProfileData = async () => {
      // If we already have a profile and it's for the current user, don't reload
      if (profile && profile.uid === user?.uid && profileLoaded) {
        console.log("Profile already loaded, skipping");
        return;
      }

      setLoadingProfile(true);
      
      try {
        // First try to load from AsyncStorage for immediate display
        const storedProfileJson = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfileJson) {
          const storedProfile = JSON.parse(storedProfileJson);
          // Only use stored profile if it's for the current user
          if (storedProfile.uid === user?.uid) {
            console.log("Using cached profile");
            setProfile(storedProfile);
            setLoadingProfile(false); // Stop loading indicator right away
          }
        }
        
        // If we have a user, set up Firestore listener to get real-time updates
        if (user?.uid) {
          console.log("Setting up Firestore listener for profile");
          unsubscribe = firestore
            .collection('users')
            .doc(user.uid)
            .onSnapshot(
              async (doc) => {
                if (doc.exists) {
                  const docData = {
                    ...doc.data(),
                    uid: user.uid, // Ensure UID is always included
                  };
                  
                  setProfile(docData);
                  setProfileLoaded(true);
                  
                  // Store updated profile offline
                  try {
                    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(docData));
                  } catch (err) {
                    console.warn('Failed to store offline profile:', err);
                  }
                } else {
                  // No profile document exists yet
                  console.log("No profile document exists");
                  setProfile({ uid: user.uid }); // Create minimal profile with UID
                }
                setLoadingProfile(false);
              },
              (err) => {
                console.error('Error fetching user profile:', err);
                setError(err.message);
                setLoadingProfile(false);
              }
            );
        } else {
          // No user, reset profile
          setProfile(null);
          setProfileLoaded(false);
          setLoadingProfile(false);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.message);
        setLoadingProfile(false);
      }
    };
    
    loadProfileData();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  // Update the Firestore doc & store offline
  const updateProfile = async (updates) => {
    if (!user) return;
    
    try {
      // Update Firestore
      await firestore.collection('users').doc(user.uid).update(updates);
      
      // Update local state immediately for responsive UI
      const updatedProfile = { 
        ...profile, 
        ...updates,
        uid: user.uid, // Ensure UID is always included
      };
      setProfile(updatedProfile);
      
      // Update cached version
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return { profile, loadingProfile, error, updateProfile, profileLoaded };
};
