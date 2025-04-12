// src/screens/Settings/SettingsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../context/SettingsContext";
import { getAppVersion } from "../../utils/getAppVersion";
import { useTheme } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useSettings();
  const { colors } = useTheme();
  const version = getAppVersion();
  const { logout } = useAuth();

  const handleShareToFriend = async () => {
    try {
      await Share.share({
        message:
          "Check out the Fikra app for entrepreneurs! https://example.com/app",
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Attempting to logout...");
      await logout();
      console.log("Logout successful");
      
      // Use CommonActions.reset to navigate to Auth stack after logout
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }],
        })
      );
    } catch (err) {
      console.error("Logout error:", err);
      Alert.alert("Logout Error", err.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Share */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={handleShareToFriend}
      >
        <View style={styles.row}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={[styles.itemText, { color: colors.text }]}>
            Share to friend
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </TouchableOpacity>

      {/* Toggle Theme */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={toggleTheme}
      >
        <View style={styles.row}>
          <Ionicons name="time-outline" size={22} color={colors.primary} />
          <Text style={[styles.itemText, { color: colors.text }]}>Theme</Text>
        </View>
        <Text style={[styles.subText, { color: colors.text }]}>
          {theme === "light" ? "Light mode" : "Dark mode"}
        </Text>
      </TouchableOpacity>

      {/* Account Settings */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={() => navigation.navigate("AccountSettings")}
      >
        <View style={styles.row}>
          <Ionicons name="person-outline" size={22} color={colors.primary} />
          <Text style={[styles.itemText, { color: colors.text }]}>Account</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[
          styles.item,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
        onPress={handleLogout}
      >
        <View style={styles.row}>
          <Ionicons name="exit-outline" size={22} color="#F44E3B" />
          <Text style={[styles.itemText, { color: colors.text }]}>Log out</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.border} />
      </TouchableOpacity>

      {/* Version info */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.text }]}>
          Version: {version}
        </Text>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  subText: {
    fontSize: 14,
    marginTop: 4,
  },
  versionContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
  },
});
