// src/screens/Ideas/IdeasListScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation, useTheme, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useIdeaGenerator } from "../../hooks/useIdeaGenerator";
import { useAuth } from "../../hooks/useAuth";

const IdeasListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { loading, error, fetchSavedIdeas } = useIdeaGenerator();
  const [ideas, setIdeas] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const hasFetchedRef = useRef(false);

  // Only fetch ideas when the component mounts and when user changes
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      loadIdeas();
      hasFetchedRef.current = true;
    } else if (!user) {
      setIdeas([]);
      hasFetchedRef.current = false;
    }
  }, [user]);

  // Use useFocusEffect to reload ideas only when necessary
  useFocusEffect(
    React.useCallback(() => {
      // Only reload ideas if we have a refreshIdeas param
      if (route.params?.refreshIdeas) {
        loadIdeas();
        // Clear the param to prevent multiple refreshes
        navigation.setParams({ refreshIdeas: undefined });
      }
    }, [route.params?.refreshIdeas])
  );

  const loadIdeas = async () => {
    if (user) {
      const savedIdeas = await fetchSavedIdeas();
      setIdeas(savedIdeas);
      setInitialLoadComplete(true);
    } else {
      setIdeas([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIdeas();
    setRefreshing(false);
  };

  const handleAddIdea = () => {
    // Navigate to the CreateIdea tab in the bottom tab navigation
    // We need to use the root navigator to switch tabs
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.navigate("CreateIdeaNavigator", { screen: "IdeaChoice" });
    }
  };

  const handleSelectIdea = (idea) => {
    navigation.navigate("IdeaDetail", { idea });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleAddIdea} style={{ marginRight: 16 }}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.ideaItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSelectIdea(item)}
    >
      <View style={[styles.ideaAvatar, { backgroundColor: item.color }]} />
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
        {item.isGenerated && (
          <View style={styles.tagContainer}>
            <Text style={[styles.tag, { backgroundColor: colors.primary }]}>
              AI Generated
            </Text>
          </View>
        )}
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.border}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="bulb-outline" size={80} color={colors.primary} style={styles.emptyStateIcon} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No Ideas Yet
      </Text>
      <Text style={[styles.emptyStateDescription, { color: colors.text }]}>
        Start generating business ideas tailored to your skills and interests
      </Text>
      <TouchableOpacity
        style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          const rootNavigation = navigation.getParent();
          if (rootNavigation) {
            rootNavigation.navigate("CreateIdeaNavigator", { screen: "IdeaChoice" });
          }
        }}
      >
        <Text style={styles.emptyStateButtonText}>Generate Ideas</Text>
      </TouchableOpacity>
    </View>
  );

  // Only show loading on initial load and when there are no ideas to display
  if (loading && !initialLoadComplete && !refreshing && ideas.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && ideas.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={50} color={colors.primary} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={loadIdeas}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={ideas.length === 0 ? styles.fullHeight : { paddingVertical: 8 }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

export default IdeasListScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  fullHeight: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  ideaItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  ideaAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  ideaTextContainer: { 
    flex: 1 
  },
  ideaTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 2 
  },
  ideaDescription: { 
    fontSize: 14 
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tag: {
    fontSize: 10,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});
