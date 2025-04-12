import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MarketAnalysisScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Get idea from route params
  const idea = route.params?.idea;
  
  // Navigate to a specific analysis tool
  const navigateToTool = (toolName) => {
    switch (toolName) {
      case 'locationAnalysis':
        navigation.navigate('LocationAnalysis', { idea });
        break;
      case 'socialCompetitors':
        alert('Social Media Competitors is coming soon!');
        break;
      case 'competitiveMatrix':
        alert('Competitive Matrix is coming soon!');
        break;
      case 'trends':
        alert('Industry Trends is coming soon!');
        break;
      default:
        break;
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Market Analysis Tools
        </Text>
        <Text style={[styles.headerDescription, { color: colors.text + 'CC' }]}>
          Analyze your market to make better business decisions
        </Text>
        
        <View style={styles.cardsContainer}>
          {/* Location Analysis Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigateToTool('locationAnalysis')}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="location" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Location Analysis
            </Text>
            <Text style={[styles.cardDescription, { color: colors.text + 'CC' }]}>
              Identify optimal business locations with heatmaps showing opportunity scores
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardStatus, { color: colors.primary }]}>Available Now</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
          
          {/* Social Media Competitors Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigateToTool('socialCompetitors')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#E1306C20' }]}>
              <Ionicons name="logo-instagram" size={32} color="#E1306C" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Social Media Competitors
            </Text>
            <Text style={[styles.cardDescription, { color: colors.text + 'CC' }]}>
              Analyze competitors on Instagram, Facebook, and other platforms
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardStatus, { color: '#FFC107' }]}>Coming Soon</Text>
              <Ionicons name="time-outline" size={16} color="#FFC107" />
            </View>
          </TouchableOpacity>
          
          {/* Competitive Matrix Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigateToTool('competitiveMatrix')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#9C27B020' }]}>
              <Ionicons name="grid" size={32} color="#9C27B0" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Competitive Matrix
            </Text>
            <Text style={[styles.cardDescription, { color: colors.text + 'CC' }]}>
              Compare your business against competitors across key factors
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardStatus, { color: '#FFC107' }]}>Coming Soon</Text>
              <Ionicons name="time-outline" size={16} color="#FFC107" />
            </View>
          </TouchableOpacity>
          
          {/* Industry Trends Card */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigateToTool('trends')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#00968820' }]}>
              <Ionicons name="trending-up" size={32} color="#009688" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Industry Trends
            </Text>
            <Text style={[styles.cardDescription, { color: colors.text + 'CC' }]}>
              Discover market trends and growth opportunities in your industry
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardStatus, { color: '#FFC107' }]}>Coming Soon</Text>
              <Ionicons name="time-outline" size={16} color="#FFC107" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default MarketAnalysisScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  cardsContainer: {
    width: '100%',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 