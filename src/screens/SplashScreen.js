// src/screens/SplashScreen.js
import React from "react";
import { View, ActivityIndicator, StyleSheet, Image, Text } from "react-native";
import { useTheme } from "@react-navigation/native";

const SplashScreen = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/icons/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>Fikra</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          AI-Powered Business Idea Generator
        </Text>
      </View>
      <ActivityIndicator size="large" color="#5D5FEF" style={styles.loader} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 20,
  },
});
