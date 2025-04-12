import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MarketingToolsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.comingSoonContainer}>
        <Ionicons name="megaphone" size={80} color={colors.primary} />
        <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
          Coming Soon
        </Text>
        <Text style={[styles.comingSoonDescription, { color: colors.text + 'CC' }]}>
          We're working on powerful marketing tools to help you create:
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.text }]}>AI-generated logos</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.text }]}>Social media content</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.text }]}>Marketing strategy</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.text }]}>Ad campaigns</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MarketingToolsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  comingSoonDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 