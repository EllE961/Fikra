// src/screens/Auth/EmailLoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../services/firebase";

const EmailLoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    try {
      setErrorMessage("");
      setLoading(true);
      await auth.signInWithEmailAndPassword(email.trim(), password);
    } catch (error) {
      let message = "Login failed. Please try again.";
      switch (error.code) {
        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;
        case "auth/user-disabled":
          message = "This user has been disabled. Contact support.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password. Please try again.";
          break;
        case "auth/too-many-requests":
          message = "Too many failed attempts. Please wait and try again.";
          break;
        case "auth/invalid-credential":
          message = "Incorrect email or password. Please try again.";
          break;
        default:
          message = error.message;
          break;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign In with Email</Text>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
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
      {loading ? (
        <ActivityIndicator size="large" color="#5D5FEF" />
      ) : (
        <Button title="Sign In" onPress={handleEmailLogin} />
      )}
      <Text style={styles.link} onPress={handleGoToRegister}>
        Don't have an account? Register
      </Text>
      <Text
        style={styles.link}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        Forgot Password?
      </Text>
    </View>
  );
};

export default EmailLoginScreen;

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
  errorText: { color: "red", textAlign: "center", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  link: { marginTop: 12, color: "#5D5FEF", textAlign: "center" },
});
