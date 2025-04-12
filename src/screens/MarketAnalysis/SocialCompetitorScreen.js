import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useTheme } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const SocialCompetitorScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const route = useRoute();
  const businessIdea = route.params?.businessIdea || {};
  
  // Set up the navigation header
  useEffect(() => {
    navigation.setOptions({
      title: 'Social Media Competitors',
      headerBackTitle: 'Back',
    });
  }, [navigation]);
  
  const showComingSoonAlert = () => {
    Alert.alert(
      "Coming Soon",
      "Social Media Competitors is coming soon!",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card}
        onPress={showComingSoonAlert}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome name="instagram" size={40} color="#E1306C" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Social Media Competitors
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
              Find and analyze competitors on Instagram, Facebook, and other platforms
            </Text>
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  comingSoonContainer: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SocialCompetitorScreen; 