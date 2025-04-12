import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useIdeaGenerator } from '../../hooks/useIdeaGenerator';
import { useAuth } from '../../hooks/useAuth';
import { useLoading } from '../../context/LoadingContext';

// Business idea categories
const BUSINESS_CATEGORIES = [
  { id: 'ecommerce', label: 'E-commerce store', icon: 'cart' },
  { id: 'service', label: 'Local service', icon: 'construct' },
  { id: 'platform', label: 'Online platform/marketplace', icon: 'globe' },
  { id: 'tech', label: 'Tech startup (app/software)', icon: 'code-slash' },
  { id: 'content', label: 'Content creation/media', icon: 'film' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

// Business idea stages
const BUSINESS_STAGES = [
  { id: 'concept', label: 'Just a concept' },
  { id: 'prototype', label: 'Already tested or prototyped' },
  { id: 'customers', label: 'Already have some customers' },
  { id: 'other', label: 'Other' },
];

const ExistingIdeaScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const { saveSelectedIdea } = useIdeaGenerator();
  
  // Form state
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    audience: '',
    solution: '',
    uniqueness: '',
    revenue: '',
    category: '',
    stage: '',
    comparison: '',
  });
  
  // Helper function to generate random color
  const getRandomColor = () => {
    const colors = [
      '#ff6f91', '#845ec2', '#00c9a7', '#ffc75f', '#f9f871',
      '#0089ba', '#c34a36', '#008f7a', '#fe4a49', '#4a4e4d',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Describe Your Idea',
    });
  }, [navigation]);
  
  // Update form field value
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Move to the next section
  const handleNext = () => {
    // Validation for current section
    if (currentSection === 0 && !formData.title.trim()) {
      Alert.alert('Missing Information', 'Please provide a title for your idea.');
      return;
    }
    
    if (currentSection === 1 && !formData.problem.trim()) {
      Alert.alert('Missing Information', 'Please describe the problem your idea solves.');
      return;
    }
    
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Save the idea
      handleSaveIdea();
    }
  };
  
  // Move to the previous section
  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      navigation.goBack();
    }
  };
  
  // Save the idea to Firestore
  const handleSaveIdea = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your idea.');
      return;
    }
    
    try {
      startLoading('Saving your idea...');
      
      // Format the idea data
      const newIdea = {
        id: `manual-${Date.now()}`,
        title: formData.title,
        description: formData.description || `${formData.problem}. ${formData.solution}`,
        color: getRandomColor(),
        keyPoints: [
          formData.uniqueness,
          `Solves: ${formData.problem}`,
          `For: ${formData.audience}`
        ].filter(point => point && point !== 'Solves: ' && point !== 'For: '),
        category: formData.category,
        stage: formData.stage,
        revenue: formData.revenue,
        isGenerated: false,
        generatedAt: new Date().toISOString(),
        // Additional metadata
        problem: formData.problem,
        audience: formData.audience,
        solution: formData.solution,
        uniqueness: formData.uniqueness,
        comparison: formData.comparison,
      };
      
      // Save to Firestore (with public flag set to false by default)
      const success = await saveSelectedIdea(newIdea, false);
      
      stopLoading();
      
      if (success) {
        // Navigate to the idea detail screen
        navigation.reset({
          index: 1,
          routes: [
            { name: 'IdeasStack', params: { screen: 'IdeasList' } },
            { 
              name: 'IdeasStack', 
              params: { 
                screen: 'IdeaDetail',
                params: { idea: newIdea }
              }
            }
          ]
        });
      } else {
        Alert.alert('Error', 'Failed to save your idea. Please try again.');
      }
    } catch (error) {
      stopLoading();
      console.error('Error saving idea:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  
  // Sections of the form
  const sections = [
    // Section 1: Basic Idea
    {
      title: 'The Basics',
      description: 'Let\'s start with a simple overview of your idea',
      content: (
        <View>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            What would you call your business idea?
          </Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., Local Meal Prep Service, Tech Learning Platform"
            placeholderTextColor={colors.text + '80'}
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            In one or two sentences, what's your business idea about?
          </Text>
          <TextInput
            style={[styles.textAreaInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="Briefly describe what your business would do..."
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            Which category best describes your idea?
          </Text>
          <View style={styles.categoriesContainer}>
            {BUSINESS_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  { 
                    borderColor: colors.border,
                    backgroundColor: formData.category === category.id 
                      ? colors.primary + '20' 
                      : colors.card 
                  }
                ]}
                onPress={() => handleChange('category', category.id)}
              >
                <Ionicons 
                  name={category.icon} 
                  size={20} 
                  color={formData.category === category.id ? colors.primary : colors.text} 
                />
                <Text 
                  style={[
                    styles.categoryText, 
                    { 
                      color: formData.category === category.id 
                        ? colors.primary 
                        : colors.text 
                    }
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    
    // Section 2: Problem & Audience
    {
      title: 'Problem & Audience',
      description: 'Every great business solves a problem for someone',
      content: (
        <View>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            What problem or need does your idea solve?
          </Text>
          <TextInput
            style={[styles.textAreaInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., Busy parents don't have time to plan healthy meals"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.problem}
            onChangeText={(text) => handleChange('problem', text)}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            Who would be your ideal customers or users?
          </Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., Working parents, small business owners, college students"
            placeholderTextColor={colors.text + '80'}
            value={formData.audience}
            onChangeText={(text) => handleChange('audience', text)}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            In what stage is your idea currently?
          </Text>
          <View style={styles.stageContainer}>
            {BUSINESS_STAGES.map((stage) => (
              <TouchableOpacity
                key={stage.id}
                style={[
                  styles.stageItem,
                  { 
                    borderColor: colors.border,
                    backgroundColor: formData.stage === stage.id 
                      ? colors.primary + '20' 
                      : colors.card 
                  }
                ]}
                onPress={() => handleChange('stage', stage.id)}
              >
                <Text 
                  style={[
                    styles.stageText, 
                    { 
                      color: formData.stage === stage.id 
                        ? colors.primary 
                        : colors.text 
                    }
                  ]}
                >
                  {stage.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    
    // Section 3: Solution & Uniqueness
    {
      title: 'Solution & Uniqueness',
      description: 'What makes your idea special?',
      content: (
        <View>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            How does your idea solve the problem you identified?
          </Text>
          <TextInput
            style={[styles.textAreaInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., An app that creates custom meal plans based on preferences and dietary needs"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.solution}
            onChangeText={(text) => handleChange('solution', text)}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            What makes your solution different or better than existing options?
          </Text>
          <TextInput
            style={[styles.textAreaInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., Focus on locally-sourced ingredients, AI-powered personalization"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.uniqueness}
            onChangeText={(text) => handleChange('uniqueness', text)}
          />
          
          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            If you had to compare your idea to an existing business, what would it be?
          </Text>
          <TextInput
            style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., It's like Uber, but for pet grooming"
            placeholderTextColor={colors.text + '80'}
            value={formData.comparison}
            onChangeText={(text) => handleChange('comparison', text)}
          />
        </View>
      ),
    },
    
    // Section 4: Revenue & Final Thoughts
    {
      title: 'Revenue & Next Steps',
      description: 'How will your business make money?',
      content: (
        <View>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            How do you plan to make money with this idea?
          </Text>
          <TextInput
            style={[styles.textAreaInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="E.g., Subscription model, one-time purchases, service fees"
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={formData.revenue}
            onChangeText={(text) => handleChange('revenue', text)}
          />
          
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Your Business Idea Summary
            </Text>
            
            <View style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Title:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formData.title || 'Not specified'}</Text>
            </View>
            
            <View style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Problem:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formData.problem || 'Not specified'}</Text>
            </View>
            
            <View style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Audience:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formData.audience || 'Not specified'}</Text>
            </View>
            
            <View style={[styles.summaryItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Solution:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formData.solution || 'Not specified'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>Uniqueness:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formData.uniqueness || 'Not specified'}</Text>
            </View>
          </View>
          
          <Text style={[styles.helperText, { color: colors.text + '80' }]}>
            Ready to save your idea? You can always edit or refine it later.
          </Text>
        </View>
      ),
    },
  ];
  
  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {sections.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressStep,
                { 
                  backgroundColor: index <= currentSection ? colors.primary : colors.border,
                  width: `${100 / sections.length - 2}%`
                }
              ]}
            />
          ))}
        </View>
        
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {currentSectionData.title}
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.text + '99' }]}>
            {currentSectionData.description}
          </Text>
        </View>
        
        {/* Section content */}
        <View style={styles.sectionContent}>
          {currentSectionData.content}
        </View>
        
        {/* Navigation buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              Back
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastSection ? 'Save Idea' : 'Next'}
            </Text>
            <Ionicons 
              name={isLastSection ? 'save-outline' : 'arrow-forward'} 
              size={18} 
              color="white" 
              style={styles.nextButtonIcon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressStep: {
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
  },
  sectionContent: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
  },
  stageContainer: {
    marginTop: 8,
  },
  stageItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  stageText: {
    fontSize: 14,
  },
  summaryContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    width: '30%',
    fontWeight: '600',
  },
  summaryValue: {
    flex: 1,
  },
  helperText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
});

export default ExistingIdeaScreen; 