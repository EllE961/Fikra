// src/screens/Auth/CheckEmailVerificationScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { auth, firestore } from "../../services/firebase";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshRootNavigation, navigateToMainTabs } from "../../navigationRef";

const VERIFY_DURATION = 300; // 300 seconds (5 minutes)

const CheckEmailVerificationScreen = () => {
  const navigation = useNavigation();
  const [secondsLeft, setSecondsLeft] = useState(VERIFY_DURATION);
  const [loadingTime, setLoadingTime] = useState(true);
  const intervalRef = useRef(null);

  // Function to delete the user and navigate to LoginOptionsScreen
  const deleteAccountAndNavigate = async () => {
    if (!auth.currentUser) return;
    try {
      const uid = auth.currentUser.uid;
      
      // First sign out before deleting the account to clear authentication state
      await auth.signOut();
      
      // Delete the user's Firestore document if it exists
      const userDocRef = firestore.collection("users").doc(uid);
      const docSnap = await userDocRef.get();
      if (docSnap.exists) {
        await userDocRef.delete();
      }
      
      // Clear any stored user session data
      try {
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.warn("Error clearing AsyncStorage:", e);
      }
      
      // Delete the user from Firebase Auth (using admin SDK or cloud function in production)
      // This is simplified for the demo - in production use a cloud function
      /* 
      await auth.currentUser.delete();
      Alert.alert(
        "Account Deleted",
        "You did not verify your email in time. Your account has been removed."
      );
      */
      
      // Force navigation reset to the very root level
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        })
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "An error occurred while deleting your account.");
      
      // Still try to reset navigation even if there was an error
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        })
      );
    }
  };

  // Calculate remaining time from the creation timestamp in Firestore
  useEffect(() => {
    const calculateRemainingTime = async () => {
      console.log("Calculating verification remaining time...");
      const user = auth.currentUser;
      if (!user) {
        console.log("No current user found, navigating to Auth");
        // Don't navigate directly to LoginOptions - navigate to Auth stack instead
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          })
        );
        return;
      }
      
      // Add a safety timeout to ensure we never get stuck in loading state
      const safetyTimeout = setTimeout(() => {
        console.log("Safety timeout triggered - forcing loading state to complete");
        setLoadingTime(false);
        setSecondsLeft(VERIFY_DURATION);
      }, 5000); // 5 second safety timeout
      
      try {
        console.log("Fetching user document for UID:", user.uid);
        const docRef = firestore.collection("users").doc(user.uid);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
          console.log("User document found:", JSON.stringify(docSnap.data()));
          
          // Check if we can get createdAt field
          if (docSnap.data().createdAt) {
            const createdAt = docSnap.data().createdAt.toDate();
            console.log("User created at:", createdAt);
            const now = new Date();
            const elapsed = Math.floor((now - createdAt) / 1000);
            const remaining = VERIFY_DURATION - elapsed;
            
            if (remaining <= 0) {
              console.log("Verification time expired, deleting account");
              await deleteAccountAndNavigate();
            } else {
              console.log("Time remaining for verification:", remaining);
              setSecondsLeft(remaining);
            }
          } else {
            console.log("No createdAt field found in user document, using default duration");
            setSecondsLeft(VERIFY_DURATION);
          }
        } else {
          console.log("User document doesn't exist, using default duration");
          // If no creation time, default to full duration
          setSecondsLeft(VERIFY_DURATION);
        }
      } catch (error) {
        console.error("Error calculating remaining time:", error);
        Alert.alert(
          "Error",
          "Unable to verify your account status. Please try again."
        );
      } finally {
        clearTimeout(safetyTimeout); // Clear the safety timeout
        console.log("Finished calculating time, setting loadingTime to false");
        setLoadingTime(false);
      }
    };

    calculateRemainingTime();
  }, [navigation]);

  // Start the countdown timer once loadingTime is false
  useEffect(() => {
    if (loadingTime) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          deleteAccountAndNavigate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [loadingTime]);

  // Handler for resending verification email
  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.sendEmailVerification();
      Alert.alert("Verification Email Sent", "Please check your inbox.");
    } catch (error) {
      console.error("Resend email error:", error);
      Alert.alert("Error", "Failed to resend verification email.");
    }
  };

  // Handler for checking verification status
  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;
    try {
      // Reload the user to get the latest email verification status
      await auth.currentUser.reload();
      
      if (auth.currentUser.emailVerified) {
        // Update Firestore document
        const uid = auth.currentUser.uid;
        await firestore
          .collection("users")
          .doc(uid)
          .set({ 
            requiresEmailVerification: false,
            emailVerified: true 
          }, { merge: true });
        
        // First update local storage to ensure changes are persisted
        try {
          // Get the current stored user
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
            const userData = JSON.parse(userJson);
            // Update the emailVerified flag
            userData.emailVerified = true;
            // Save it back
            await AsyncStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Error updating user in AsyncStorage:", err);
        }
        
        // Force a reload of the user
        console.log("Email verified, directly navigating to MainTabs");
        
        // Simpler approach: just navigate directly to MainTabs
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }]
        });
        
        // Show success message after navigation
        Alert.alert("Success", "Your email is now verified!");
      } else {
        Alert.alert("Not Verified", "Your email is not verified yet.");
      }
    } catch (error) {
      console.error("Check verification error:", error);
      Alert.alert("Error", "Failed to check verification status.");
    }
  };

  const handleCancelAndSignOut = async () => {
    try {
      console.log("User cancelling verification, signing out");
      
      // Clear any stored user session data
      try {
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.warn("Error clearing AsyncStorage:", e);
      }
      
      // Sign out of Firebase
      await auth.signOut();
      
      // Navigate to Auth stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        })
      );
    } catch (error) {
      console.error("Error signing out:", error);
      
      // Force navigation even if sign out fails
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        })
      );
    }
  };

  if (loadingTime) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Email Verification</Text>
        <Text style={styles.infoText}>Loading verification status...</Text>
        <Text style={styles.subInfoText}>
          If this screen doesn't change within a few seconds, there may be a connection issue.
        </Text>
        
        {/* Add an escape button after a short delay */}
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton, { marginTop: 30 }]} 
          onPress={handleCancelAndSignOut}
        >
          <Text style={styles.buttonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!auth.currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>No user found. Please log in again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.infoText}>
        A verification link was sent to {auth.currentUser.email}.
      </Text>
      <Text style={styles.infoText}>
        You have{" "}
        <Text style={styles.timerText}>
          {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}
        </Text>{" "}
        left to verify your email before your account is deleted.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleResendEmail}>
        <Text style={styles.buttonText}>Resend Verification Email</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleCheckVerification}>
        <Text style={styles.buttonText}>I Verified My Email</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.cancelButton]} 
        onPress={handleCancelAndSignOut}
      >
        <Text style={styles.buttonText}>Cancel & Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckEmailVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF", // Replace with theme colors if needed
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F00",
  },
  button: {
    backgroundColor: "#5D5FEF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    marginTop: 20,
  },
  subInfoText: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
});
