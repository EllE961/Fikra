// src/components/ThemedView.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSettings } from "../context/SettingsContext";

const ThemedView = () => {
  const { colors } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Hello, Themed World!
      </Text>
    </View>
  );
};

export default ThemedView;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
