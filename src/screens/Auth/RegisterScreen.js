// src/screens/Auth/RegisterScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../../services/firebase";
import {
  isValidEmail,
  isStrongPassword,
  getPasswordFeedback,
} from "../../modules/Auth/utils";
import PasswordStrength from "../../components/PasswordStrength";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    setErrorMessage("");
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordError("");

    // Validate email format
    if (!isValidEmail(email.trim())) {
      setErrorMessage("Please enter a valid email.");
      return;
    }

    // Check password strength
    if (!isStrongPassword(password)) {
      const feedback = getPasswordFeedback(password);
      setErrorMessage(
        `Password is too weak. ${
          feedback.warning || ""
        } ${feedback.suggestions.join(" ")}`
      );
      return;
    }

    try {
      // Create the user
      const userCredential = await auth.createUserWithEmailAndPassword(
        email.trim(),
        password
      );
      const user = userCredential.user;

      // Immediately send email verification
      await user.sendEmailVerification();

      // Store user profile in Firestore with creation time and verification flag
      const createdAt = new Date();
      await firestore.collection("users").doc(user.uid).set({
        uid: user.uid,
        username: username.trim(),
        email: email.trim(),
        createdAt,
        requiresEmailVerification: true,
      });

      Alert.alert(
        "Registration Successful",
        "A verification email has been sent. Please check your inbox."
      );

      // Navigate to the email verification screen
      navigation.reset({
        index: 0,
        routes: [{ name: "CheckEmailVerification" }],
      });
    } catch (error) {
      let message = "Registration failed. Please try again.";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already in use. Try another one.";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          message = "Password is too weak. Please choose a stronger one.";
          break;
        default:
          message = error.message;
          break;
      }
      setErrorMessage(message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create an Account</Text>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="words"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <PasswordStrength password={password} />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <Button title="Register" onPress={handleRegister} />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate("EmailLogin")}
      >
        Already have an account? Sign in
      </Text>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: { color: "red", marginBottom: 12, textAlign: "center" },
  link: { marginTop: 12, color: "#5D5FEF", textAlign: "center" },
});
