import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const IdeaChoiceScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Create Business Idea',
    });
  }, [navigation]);

  const handleGenerateIdea = () => {
    navigation.navigate('CreateIdea');
  };

  const handleExistingIdea = () => {
    navigation.navigate('ExistingIdea');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, { color: colors.text }]}>
        How would you like to create your business idea?
      </Text>
      
      <View style={styles.optionsContainer}>
        {/* Generate New Idea Option */}
        <TouchableOpacity 
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleGenerateIdea}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="bulb" size={40} color={colors.primary} />
          </View>
          
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            Generate AI Business Ideas
          </Text>
          
          <Text style={[styles.optionDescription, { color: colors.text + '99' }]}>
            Answer questions about your skills and preferences, and our AI will generate personalized business ideas for you.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Personalized to your profile</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Multiple ideas to choose from</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Analysis of market potential</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleGenerateIdea}
          >
            <Text style={styles.actionButtonText}>Start Generating</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {/* Input Existing Idea Option */}
        <TouchableOpacity 
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleExistingIdea}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="create" size={40} color={colors.primary} />
          </View>
          
          <Text style={[styles.optionTitle, { color: colors.text }]}>
            Describe Your Existing Idea
          </Text>
          
          <Text style={[styles.optionDescription, { color: colors.text + '99' }]}>
            Already have a business idea in mind? Describe it step-by-step and we'll help you refine and develop it further.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Structured guidance</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>AI refinement suggestions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.text }]}>Business model development</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleExistingIdea}
          >
            <Text style={styles.actionButtonText}>Describe My Idea</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default IdeaChoiceScreen; 