// src/screens/Profile/ProfileScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useTheme, useFocusEffect, useRoute } from "@react-navigation/native";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useIdeaGenerator } from "../../hooks/useIdeaGenerator";
import defaultAvatar from "../../assets/images/defaultAvatar.png";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile, loadingProfile, error: profileError, profileLoaded } = useUserProfile();
  const { fetchSavedIdeas, loading: loadingIdeas, error: ideasError } = useIdeaGenerator();
  const [publicIdeas, setPublicIdeas] = useState([]);
  const { colors } = useTheme();
  const hasFetchedIdeasRef = useRef(false);
  const [initialIdeasLoadComplete, setInitialIdeasLoadComplete] = useState(false);

  // Only fetch public ideas when the profile changes or on initial load
  useEffect(() => {
    if (profile && !hasFetchedIdeasRef.current && profileLoaded) {
      loadPublicIdeas();
      hasFetchedIdeasRef.current = true;
    }
  }, [profile, profileLoaded]);

  // Fetch ideas when the screen is focused but only if refresh needed
  useFocusEffect(
    React.useCallback(() => {
      // Only reload ideas when profile changes or when explicitly requested
      if (profile && hasFetchedIdeasRef.current && navigation.isFocused() && 
          (route.params?.refreshIdeas || route.params?.profileUpdated)) {
        loadPublicIdeas();
        // Clear parameters
        navigation.setParams({
          refreshIdeas: undefined,
          profileUpdated: undefined
        });
      }
    }, [profile?.avatarUrl, profile?.username, route.params?.refreshIdeas, route.params?.profileUpdated])
  );

  // Load only public ideas
  const loadPublicIdeas = async () => {
    if (!profile) return;
    
    const allIdeas = await fetchSavedIdeas();
    // Filter only public ideas
    const publicOnes = allIdeas.filter(idea => idea.isPublic === true);
    setPublicIdeas(publicOnes);
    setInitialIdeasLoadComplete(true);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { userProfile: profile });
  };

  const handleSelectIdea = (idea) => {
    navigation.navigate("IdeasStack", {
      screen: 'IdeaDetail',
      params: { idea }
    });
  };

  const renderIdeaItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.ideaItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() => handleSelectIdea(item)}
    >
      <View
        style={[styles.ideaIconContainer, { backgroundColor: item.color }]}
      />
      <View style={styles.ideaTextContainer}>
        <Text style={[styles.ideaTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[styles.ideaDescription, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyIdeas = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="information-circle-outline" size={50} color={colors.text} />
      <Text style={[styles.emptyStateText, { color: colors.text }]}>
        You don't have any public ideas yet
      </Text>
    </View>
  );

  // Show loading only during initial profile load
  if (loadingProfile && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const error = profileError || ideasError;
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.text }}>
          No profile found. Please log in or create a profile.
        </Text>
      </View>
    );
  }

  const avatarSource = profile.avatarUrl
    ? { uri: profile.avatarUrl }
    : defaultAvatar;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.userInfoContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleEditProfile}
        >
          <Image
            source={avatarSource}
            style={styles.avatar}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={styles.nameRow}>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {profile.username || "No Name"}
          </Text>
          <TouchableOpacity
            style={[styles.editIcon, { backgroundColor: colors.primary }]}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.myIdeasContainer}>
        <Text style={[styles.myIdeasTitle, { color: colors.text }]}>
          My Public Ideas
        </Text>
        
        {/* Show a loading indicator only during initial ideas load */}
        {loadingIdeas && !initialIdeasLoadComplete ? (
          <View style={styles.ideasLoadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={publicIdeas}
            keyExtractor={(item) => item.id}
            renderItem={renderIdeaItem}
            ListEmptyComponent={renderEmptyIdeas}
            style={{ marginTop: 8 }}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ideasLoadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  userInfoContainer: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    marginBottom: 12,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 8,
  },
  editIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  myIdeasContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  myIdeasTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  ideaItem: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
  },
  ideaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  ideaTextContainer: {
    flex: 1,
  },
  ideaTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  ideaDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
  },
});
