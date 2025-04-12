import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation, useTheme } from "@react-navigation/native";

const AvatarDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { avatarUrl } = route.params || {};

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card }]}
        onPress={handleEditProfile}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          Edit your profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AvatarDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "80%" },
  button: {
    alignSelf: "center",
    marginBottom: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { fontSize: 16 },
});
