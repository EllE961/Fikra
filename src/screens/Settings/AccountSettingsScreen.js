// src/screens/Settings/AccountSettingsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { getAppVersion } from "../../utils/getAppVersion";

const AccountSettingsScreen = () => {
  const { colors } = useTheme();
  const version = getAppVersion();

  const handlePrivacyTerms = () => {
    Linking.openURL("https://example.com/privacy-terms").catch(() => {
      Alert.alert("Error", "Cannot open link");
    });
  };

  const handleDirectionsForUse = () => {
    Alert.alert("Directions for Use", "Details on how to use the app...");
  };

  const handleContactUs = () => {
    Alert.alert("Contact Us", "Please email support at support@example.com");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Privacy & Terms */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={handlePrivacyTerms}
      >
        <Text style={[styles.label, { color: colors.text }]}>
          Privacy & Terms of Service
        </Text>
      </TouchableOpacity>

      {/* Directions for Use */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={handleDirectionsForUse}
      >
        <Text style={[styles.label, { color: colors.text }]}>
          Directions for Use
        </Text>
      </TouchableOpacity>

      {/* Contact Us */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={handleContactUs}
      >
        <Text style={[styles.label, { color: colors.text }]}>Contact Us</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.text }]}>
          Version: {version}
        </Text>
      </View>
    </ScrollView>
  );
};

export default AccountSettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  versionContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
  },
});
