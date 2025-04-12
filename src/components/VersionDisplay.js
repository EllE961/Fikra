// src/components/VersionDisplay.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getAppVersion } from "../utils/getAppVersion";
// or however you retrieve the version (Constants.manifest, app.json, etc.)

const VersionDisplay = () => {
  const version = getAppVersion(); // e.g., "1.0.3"
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Version: {version}</Text>
    </View>
  );
};

export default VersionDisplay;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  text: {
    fontSize: 14,
  },
});
