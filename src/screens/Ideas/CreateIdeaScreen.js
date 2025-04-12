import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation, useTheme, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useIdeaGenerator } from '../../hooks/useIdeaGenerator';
import { useAuth } from '../../hooks/useAuth';
import { ENV } from '../../constants/env';
import IdeaSelectionModal from '../../components/IdeaSelectionModal';

// Suggestion data for each question field
const SUGGESTIONS = {
  occupation: ['Software Developer', 'Teacher', 'Designer', 'Marketing', 'Finance', 'Healthcare', 'Student', 'Engineer'],
  skills: ['Programming', 'Marketing', 'Design', 'Writing', 'Sales', 'Leadership', 'Analysis', 'Customer Service'],
  interests: ['Technology', 'Health', 'Education', 'Food', 'Travel', 'Finance', 'Art', 'Sports', 'Music'],
  businessReason: ['Financial Freedom', 'Passion Project', 'Side Income', 'Full-time Business', 'Social Impact'],
  successVision: ['Profitable Side Hustle', 'Growing Business', 'Industry Leader', 'Creating Jobs', 'Acquisition'],
  timeframe: ['3 months', '6 months', '1 year', '2-3 years', 'Long-term'],
  budget: ['Under $1,000', '$1,000-$5,000', '$5,000-$10,000', '$10,000-$50,000', 'Over $50,000'],
  runway: ['3 months', '6 months', '1 year', '2 years', 'No specific timeline'],
  hoursPerWeek: ['5-10 hours', '10-20 hours', '20-30 hours', '30-40 hours', 'Full-time+'],
  location: ['Remote/Online', 'Local Community', 'Major City', 'Rural Area', 'National', 'International'],
  preferredIndustry: ['Technology', 'Health & Wellness', 'Education', 'Food & Beverage', 'E-commerce', 'Creative Services', 'Financial Services'],
  industriesToAvoid: ['Tobacco', 'Gambling', 'Alcohol', 'Weapons', 'Oil & Gas', 'Adult Entertainment'],
  targetAudience: ['Consumers (B2C)', 'Businesses (B2B)', 'Government', 'Non-profits', 'Educational Institutions'],
  specificNiche: ['Parents', 'Students', 'Professionals', 'Seniors', 'Health Enthusiasts', 'Tech Early Adopters', 'Eco-conscious'],
  existingTools: ['Computer/Software', 'Workshop/Equipment', 'Office Space', 'Vehicle', 'Specialized Tools'],
  communitySupport: ['Industry Mentors', 'Technical Network', 'Marketing Contacts', 'Potential Partners', 'Investors/Financial Advisors'],
  personalObligations: ['Childcare', 'Full-time Job', 'School/Education', 'Health Concerns', 'Family Responsibilities'],
  otherFactors: ['Geographic Limitations', 'Legal Regulations', 'Seasonal Factors', 'Cultural Considerations', 'Sustainability Goals'],
};

// Enums for form sections
const SECTIONS = {
  PERSONAL: 'personal',
  GOALS: 'goals',
  FINANCES: 'finances',
  CONSTRAINTS: 'constraints',
  MARKET: 'market',
  APPROACH: 'approach',
  RESOURCES: 'resources',
  PERSONAL_CONSTRAINTS: 'personalConstraints',
};

// Question sections with progress tracking
const SECTION_DATA = [
  {
    id: SECTIONS.PERSONAL,
    title: 'Personal Background',
    description: 'Tell us about yourself and your skills',
    progress: 0,
  },
  {
    id: SECTIONS.GOALS,
    title: 'Goals & Motivation',
    description: 'What drives you to start a business?',
    progress: 0.14,
  },
  {
    id: SECTIONS.FINANCES,
    title: 'Finances & Budget',
    description: 'Your financial situation and limitations',
    progress: 0.28,
  },
  {
    id: SECTIONS.CONSTRAINTS,
    title: 'Practical Constraints',
    description: 'Time and location considerations',
    progress: 0.42,
  },
  {
    id: SECTIONS.MARKET,
    title: 'Market & Customers',
    description: 'Your preferred industry and target audience',
    progress: 0.56,
  },
  {
    id: SECTIONS.APPROACH,
    title: 'Approach & Personality',
    description: 'Your work style and risk tolerance',
    progress: 0.70,
  },
  {
    id: SECTIONS.RESOURCES,
    title: 'Existing Resources',
    description: 'Tools and network you already have',
    progress: 0.84,
  },
  {
    id: SECTIONS.PERSONAL_CONSTRAINTS,
    title: 'Personal Constraints',
    description: 'Any other factors we should consider',
    progress: 0.98,
  },
];

// SuggestionChips component to display clickable suggestions
const SuggestionChips = ({ suggestions, onSelectSuggestion, colors }) => {
  return (
    <View style={styles.suggestionsContainer}>
      <Text style={[styles.suggestionsLabel, { color: colors.text + '80' }]}>
        Suggestions:
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView}>
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => onSelectSuggestion(suggestion)}
          >
            <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Common countries and cities for business ideas
const COMMON_COUNTRIES = [
  'Oman',
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Bahrain',
  'Kuwait',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Singapore',
  'Japan',
  'India',
  'China',
];

// Cities for Oman and UAE (most common countries in the region)
const CITIES_BY_COUNTRY = {
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Barka', 'Ibri', 'Duqm'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran'],
  'Qatar': ['Doha', 'Al Wakrah', 'Al Khor', 'Lusail', 'Umm Salal', 'Al Rayyan'],
  'Bahrain': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town'],
  'Kuwait': ['Kuwait City', 'Hawalli', 'Salmiya', 'Ahmadi', 'Jahra'],
};

// Add a new location selector component
const LocationSelector = ({ value, onChange, colors }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize selected location if already set
  useEffect(() => {
    if (value) {
      const parts = value.split(', ');
      if (parts.length === 2) {
        setSelectedCity(parts[0]);
        setSelectedCountry(parts[1]);
      } else {
        setCustomLocation(value);
      }
    }
  }, [value]);
  
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setSelectedCity('');
  };
  
  const handleSelectCity = (city) => {
    setSelectedCity(city);
  };
  
  const handleSaveLocation = () => {
    let locationString = '';
    
    if (selectedCountry && selectedCity) {
      locationString = `${selectedCity}, ${selectedCountry}`;
    } else if (selectedCountry) {
      locationString = selectedCountry;
    } else if (customLocation) {
      locationString = customLocation;
    }
    
    onChange(locationString);
    setShowModal(false);
  };
  
  const getAvailableCities = () => {
    return selectedCountry && CITIES_BY_COUNTRY[selectedCountry] ? CITIES_BY_COUNTRY[selectedCountry] : [];
  };
  
  const filteredCountries = COMMON_COUNTRIES.filter(
    country => country.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <TouchableOpacity
        style={[styles.locationSelector, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="location-outline" size={24} color={colors.primary} style={styles.locationIcon} />
        <Text style={[styles.locationDisplay, { color: value ? colors.text : colors.text + '80' }]}>
          {value || "Select your location"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text + '80'} />
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Your Location</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.text + '99'} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search countries..."
                placeholderTextColor={colors.text + '80'}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <Text style={[styles.sectionLabel, { color: colors.primary }]}>Country</Text>
              <View style={styles.optionsContainer}>
                {filteredCountries.map((country) => (
                  <TouchableOpacity
                    key={country}
                    style={[
                      styles.optionButton,
                      selectedCountry === country && {
                        backgroundColor: colors.primary + '20',
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleSelectCountry(country)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        selectedCountry === country && { color: colors.primary },
                      ]}
                    >
                      {country}
                    </Text>
                    {selectedCountry === country && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedCountry && getAvailableCities().length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.primary, marginTop: 16 }]}>City</Text>
                  <View style={styles.optionsContainer}>
                    {getAvailableCities().map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={[
                          styles.optionButton,
                          selectedCity === city && {
                            backgroundColor: colors.primary + '20',
                            borderColor: colors.primary,
                          },
                        ]}
                        onPress={() => handleSelectCity(city)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            selectedCity === city && { color: colors.primary },
                          ]}
                        >
                          {city}
                        </Text>
                        {selectedCity === city && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              <Text style={[styles.sectionLabel, { color: colors.primary, marginTop: 16 }]}>
                Or Enter Custom Location
              </Text>
              <TextInput
                style={[styles.customLocationInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="e.g., Berlin, Germany"
                placeholderTextColor={colors.text + '80'}
                value={customLocation}
                onChangeText={setCustomLocation}
              />
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveLocation}
            >
              <Text style={styles.saveButtonText}>Save Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const CreateIdeaScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { loading, error, generateIdeas, saveSelectedIdea } = useIdeaGenerator();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Background
    occupation: '',
    skills: [],
    interests: [],
    
    // Goals & Motivation
    businessReason: '',
    successVision: '',
    timeframe: '',
    
    // Finances & Budget
    budget: '',
    willingToSeekFunding: false,
    runway: '',
    
    // Practical Constraints
    hoursPerWeek: '',
    keepCurrentJob: false,
    location: '',
    canTravel: false,
    
    // Market & Customer Preferences
    preferredIndustry: '',
    industriesToAvoid: '',
    targetAudience: '',
    specificNiche: '',
    
    // Approach & Personality
    riskLevel: 'moderate', // low, moderate, high
    adaptability: false,
    teamApproach: 'solo', // solo, partners, employees
    
    // Existing Resources & Networks
    existingTools: '',
    communitySupport: '',
    
    // Personal Constraints
    personalObligations: '',
    otherFactors: '',
  });
  
  const [currentInput, setCurrentInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [showIdeaSelection, setShowIdeaSelection] = useState(false);
  
  // Reset form when screen comes into focus, but not during active idea selection
  useFocusEffect(
    React.useCallback(() => {
      // Don't reset during active idea selection
      if (showIdeaSelection) {
        return;
      }
      
      // Reset form to initial state
      setCurrentSectionIndex(0);
      setFormData({
        // Personal Background
        occupation: '',
        skills: [],
        interests: [],
        
        // Goals & Motivation
        businessReason: '',
        successVision: '',
        timeframe: '',
        
        // Finances & Budget
        budget: '',
        willingToSeekFunding: false,
        runway: '',
        
        // Practical Constraints
        hoursPerWeek: '',
        keepCurrentJob: false,
        location: '',
        canTravel: false,
        
        // Market & Customer Preferences
        preferredIndustry: '',
        industriesToAvoid: '',
        targetAudience: '',
        specificNiche: '',
        
        // Approach & Personality
        riskLevel: 'moderate',
        adaptability: false,
        teamApproach: 'solo',
        
        // Existing Resources & Networks
        existingTools: '',
        communitySupport: '',
        
        // Personal Constraints
        personalObligations: '',
        otherFactors: '',
      });
      setCurrentInput('');
      setGeneratedIdeas([]);
    }, [showIdeaSelection])
  );
  
  // Get current section info
  const currentSection = SECTION_DATA[currentSectionIndex];
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add item to array fields (skills, interests)
  const addToArray = (field) => {
    if (!currentInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], currentInput.trim()]
    }));
    
    setCurrentInput('');
  };
  
  // Remove item from array fields
  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Move to next section
  const handleNext = () => {
    if (currentSectionIndex < SECTION_DATA.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentInput('');
    } else {
      // Generate ideas when user reaches the end
      handleGenerateIdeas();
    }
  };

  // Move to previous section
  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentInput('');
    } else {
      navigation.goBack();
    }
  };

  // Generate business ideas
  const handleGenerateIdeas = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to generate business ideas based on your profile.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      // Transform form data into the format expected by the API
      const userProfile = {
        interests: formData.interests,
        skills: formData.skills,
        location: formData.location,
        occupation: formData.occupation,
        businessReason: formData.businessReason,
        successVision: formData.successVision,
        timeframe: formData.timeframe,
        budget: formData.budget,
        hoursPerWeek: formData.hoursPerWeek,
        preferredIndustry: formData.preferredIndustry,
        targetAudience: formData.targetAudience,
        riskLevel: formData.riskLevel,
        teamApproach: formData.teamApproach,
      };
      
      console.log('Generating ideas with profile:', JSON.stringify(userProfile));
      
      // Check if API key is set
      if (!ENV.OPENAI_API_KEY || ENV.OPENAI_API_KEY === 'sk-xxxxxxx-dev') {
        Alert.alert(
          'API Key Required',
          'Please add your OpenAI API key to the .env.development file',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const ideas = await generateIdeas(userProfile);
      console.log('Generated ideas:', ideas);
      
      if (ideas && ideas.length > 0) {
        // Show the idea selection modal instead of navigating
        setGeneratedIdeas(ideas);
        setShowIdeaSelection(true);
      } else {
        Alert.alert(
          'No Ideas Generated',
          'We couldn\'t generate any ideas with the current profile. Please try adding more details.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      Alert.alert(
        'Error Generating Ideas',
        `Something went wrong: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Handle selecting an idea from the modal
  const handleSelectIdea = async (selectedIdea, makePublic) => {
    // Close the modal
    setShowIdeaSelection(false);
    
    try {
      // Save the selected idea to Firestore
      const success = await saveSelectedIdea(selectedIdea, makePublic);
      
      if (success) {
        // Use navigate instead of reset and include refreshIdeas param to trigger reload
        navigation.navigate('IdeasStack', { 
          screen: 'IdeasList',
          params: { refreshIdeas: true },
          initial: false
        });
        
        // Then navigate to the idea detail
        setTimeout(() => {
          navigation.navigate('IdeasStack', { 
            screen: 'IdeaDetail',
            params: { idea: {...selectedIdea, isPublic: makePublic} }
          });
        }, 100);
      } else {
        Alert.alert(
          'Error Saving Idea',
          'There was a problem saving your idea. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save your idea. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error saving idea:', error);
    }
  };

  // Render progress bar
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View 
        style={[
          styles.progressBar, 
          { 
            backgroundColor: colors.primary,
            width: `${currentSection.progress * 100}%` 
          }
        ]} 
      />
      <Text style={[styles.progressText, { color: colors.text }]}>
        {`${Math.round(currentSection.progress * 100)}%`}
      </Text>
    </View>
  );

  // Render section header
  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {currentSection.title}
      </Text>
      <Text style={[styles.sectionDescription, { color: colors.text }]}>
        {currentSection.description}
      </Text>
    </View>
  );

  // Render Personal Background section
  const renderPersonalSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          What is your current job or occupation?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Software Developer, Teacher, Student"
          placeholderTextColor={colors.text + '80'}
          value={formData.occupation}
          onChangeText={(text) => handleInputChange('occupation', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.occupation} 
          onSelectSuggestion={(suggestion) => handleInputChange('occupation', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          What skills do you have that could help in a business?
        </Text>
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Add a skill (e.g., coding, marketing)"
            placeholderTextColor={colors.text + '80'}
            value={currentInput}
            onChangeText={setCurrentInput}
            onSubmitEditing={() => addToArray('skills')}
          />
          <TouchableOpacity onPress={() => addToArray('skills')}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <SuggestionChips 
          suggestions={SUGGESTIONS.skills} 
          onSelectSuggestion={(suggestion) => {
            if (!formData.skills.includes(suggestion)) {
              setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, suggestion]
              }));
            }
          }} 
          colors={colors} 
        />
        <ScrollView horizontal style={styles.tagsScrollView}>
          {formData.skills.map((skill, index) => (
            <View 
              key={index}
              style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
            >
              <Text style={[styles.tagText, { color: colors.text }]}>{skill}</Text>
              <TouchableOpacity onPress={() => removeFromArray('skills', index)}>
                <Ionicons name="close-circle" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          What do you truly enjoy doing or learning about?
        </Text>
        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Add an interest (e.g., fitness, technology)"
            placeholderTextColor={colors.text + '80'}
            value={currentInput}
            onChangeText={setCurrentInput}
            onSubmitEditing={() => addToArray('interests')}
          />
          <TouchableOpacity onPress={() => addToArray('interests')}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <SuggestionChips 
          suggestions={SUGGESTIONS.interests} 
          onSelectSuggestion={(suggestion) => {
            if (!formData.interests.includes(suggestion)) {
              setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, suggestion]
              }));
            }
          }} 
          colors={colors} 
        />
        <ScrollView horizontal style={styles.tagsScrollView}>
          {formData.interests.map((interest, index) => (
            <View 
              key={index}
              style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
            >
              <Text style={[styles.tagText, { color: colors.text }]}>{interest}</Text>
              <TouchableOpacity onPress={() => removeFromArray('interests', index)}>
                <Ionicons name="close-circle" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  // Render Goals & Motivation section
  const renderGoalsSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          What is your main reason for starting a business?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Extra income, self-employment, social impact"
          placeholderTextColor={colors.text + '80'}
          value={formData.businessReason}
          onChangeText={(text) => handleInputChange('businessReason', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.businessReason} 
          onSelectSuggestion={(suggestion) => handleInputChange('businessReason', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How do you define success for this business?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Making a living, scaling big, creating impact"
          placeholderTextColor={colors.text + '80'}
          value={formData.successVision}
          onChangeText={(text) => handleInputChange('successVision', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.successVision} 
          onSelectSuggestion={(suggestion) => handleInputChange('successVision', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          When do you hope to launch or see progress?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., 3 months, 6 months, 1 year"
          placeholderTextColor={colors.text + '80'}
          value={formData.timeframe}
          onChangeText={(text) => handleInputChange('timeframe', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.timeframe} 
          onSelectSuggestion={(suggestion) => handleInputChange('timeframe', suggestion)} 
          colors={colors} 
        />
      </View>
    </View>
  );

  // Render Finances & Budget section
  const renderFinancesSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How much money can you invest in getting started?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., $500, $5,000, $20,000"
          placeholderTextColor={colors.text + '80'}
          value={formData.budget}
          onChangeText={(text) => handleInputChange('budget', text)}
          keyboardType="numeric"
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.budget} 
          onSelectSuggestion={(suggestion) => handleInputChange('budget', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Are you willing to seek a loan or investors if needed?
        </Text>
        <View style={styles.switchContainer}>
          <Switch
            value={formData.willingToSeekFunding}
            onValueChange={(value) => handleInputChange('willingToSeekFunding', value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={formData.willingToSeekFunding ? colors.primary : '#f4f3f4'}
          />
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {formData.willingToSeekFunding ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How many months can you go without profit from the business?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., 3 months, 6 months, 12 months"
          placeholderTextColor={colors.text + '80'}
          value={formData.runway}
          onChangeText={(text) => handleInputChange('runway', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.runway} 
          onSelectSuggestion={(suggestion) => handleInputChange('runway', suggestion)} 
          colors={colors} 
        />
      </View>
    </View>
  );

  // Render Practical Constraints section
  const renderConstraintsSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How many hours per week can you dedicate to your business?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., 10 hours, 20 hours, 40+ hours"
          placeholderTextColor={colors.text + '80'}
          value={formData.hoursPerWeek}
          onChangeText={(text) => handleInputChange('hoursPerWeek', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.hoursPerWeek} 
          onSelectSuggestion={(suggestion) => handleInputChange('hoursPerWeek', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Do you plan to keep your current job while starting up?
        </Text>
        <View style={styles.switchContainer}>
          <Switch
            value={formData.keepCurrentJob}
            onValueChange={(value) => handleInputChange('keepCurrentJob', value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={formData.keepCurrentJob ? colors.primary : '#f4f3f4'}
          />
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {formData.keepCurrentJob ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Where are you located?
        </Text>
        <LocationSelector 
          value={formData.location}
          onChange={(value) => handleInputChange('location', value)}
          colors={colors}
        />
        <Text style={[styles.locationHint, { color: colors.text + '80' }]}>
          This will help us find local competitors and market opportunities for your business idea
        </Text>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Do you mind traveling for your business if needed?
        </Text>
        <View style={styles.switchContainer}>
          <Switch
            value={formData.canTravel}
            onValueChange={(value) => handleInputChange('canTravel', value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={formData.canTravel ? colors.primary : '#f4f3f4'}
          />
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {formData.canTravel ? 'Yes, I can travel' : 'No, I prefer to stay local'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render Market & Customer Preferences section
  const renderMarketSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          What types of products or services interest you?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., e-commerce, food, tech, consulting"
          placeholderTextColor={colors.text + '80'}
          value={formData.preferredIndustry}
          onChangeText={(text) => handleInputChange('preferredIndustry', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.preferredIndustry} 
          onSelectSuggestion={(suggestion) => handleInputChange('preferredIndustry', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Are there industries you want to avoid?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., gambling, tobacco, oil & gas"
          placeholderTextColor={colors.text + '80'}
          value={formData.industriesToAvoid}
          onChangeText={(text) => handleInputChange('industriesToAvoid', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.industriesToAvoid} 
          onSelectSuggestion={(suggestion) => handleInputChange('industriesToAvoid', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Who do you imagine as your main customers?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., general consumers, businesses, corporate clients"
          placeholderTextColor={colors.text + '80'}
          value={formData.targetAudience}
          onChangeText={(text) => handleInputChange('targetAudience', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.targetAudience} 
          onSelectSuggestion={(suggestion) => handleInputChange('targetAudience', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Any specific niche or group you want to serve?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., parents, students, fitness enthusiasts"
          placeholderTextColor={colors.text + '80'}
          value={formData.specificNiche}
          onChangeText={(text) => handleInputChange('specificNiche', text)}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.specificNiche} 
          onSelectSuggestion={(suggestion) => handleInputChange('specificNiche', suggestion)} 
          colors={colors} 
        />
      </View>
    </View>
  );

  // Render Approach & Personality section
  const renderApproachSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How comfortable are you with taking risks?
        </Text>
        <View style={styles.radioGroupContainer}>
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              formData.riskLevel === 'low' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('riskLevel', 'low')}
          >
            <Ionicons 
              name={formData.riskLevel === 'low' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.radioLabel, { color: colors.text }]}>Low risk</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              formData.riskLevel === 'moderate' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('riskLevel', 'moderate')}
          >
            <Ionicons 
              name={formData.riskLevel === 'moderate' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.radioLabel, { color: colors.text }]}>Moderate risk</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              formData.riskLevel === 'high' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('riskLevel', 'high')}
          >
            <Ionicons 
              name={formData.riskLevel === 'high' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.radioLabel, { color: colors.text }]}>High risk</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Are you okay with trying something new and adapting if needed?
        </Text>
        <View style={styles.switchContainer}>
          <Switch
            value={formData.adaptability}
            onValueChange={(value) => handleInputChange('adaptability', value)}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={formData.adaptability ? colors.primary : '#f4f3f4'}
          />
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {formData.adaptability ? 'Yes, I can adapt' : 'No, I prefer stability'}
          </Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          How do you plan to build your team?
        </Text>
        <View style={styles.radioGroupContainer}>
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              formData.teamApproach === 'solo' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('teamApproach', 'solo')}
          >
            <Ionicons 
              name={formData.teamApproach === 'solo' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.radioLabel, { color: colors.text }]}>Solo founder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              formData.teamApproach === 'partners' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('teamApproach', 'partners')}
          >
            <Ionicons 
              name={formData.teamApproach === 'partners' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.radioLabel, { color: colors.text }]}>With co-founders/partners</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.radioButton, 
              formData.teamApproach === 'employees' && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
            ]}
            onPress={() => handleInputChange('teamApproach', 'employees')}
          >
            <Ionicons 
              name={formData.teamApproach === 'employees' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[styles.radioLabel, { color: colors.text }]}>Hire employees/freelancers</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render Existing Resources section
  const renderResourcesSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Do you already have any helpful tools, software, or equipment?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., camera, web design software, workshop tools"
          placeholderTextColor={colors.text + '80'}
          value={formData.existingTools}
          onChangeText={(text) => handleInputChange('existingTools', text)}
          multiline
          numberOfLines={3}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.existingTools} 
          onSelectSuggestion={(suggestion) => handleInputChange('existingTools', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Do you have connections who can help with advice or technical work?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., marketing friends, technical mentors, industry contacts"
          placeholderTextColor={colors.text + '80'}
          value={formData.communitySupport}
          onChangeText={(text) => handleInputChange('communitySupport', text)}
          multiline
          numberOfLines={3}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.communitySupport} 
          onSelectSuggestion={(suggestion) => handleInputChange('communitySupport', suggestion)} 
          colors={colors} 
        />
      </View>
    </View>
  );

  // Render Personal Constraints section
  const renderPersonalConstraintsSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Are there personal/family commitments that limit your hours or travel?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., childcare responsibilities, elder care, health issues"
          placeholderTextColor={colors.text + '80'}
          value={formData.personalObligations}
          onChangeText={(text) => handleInputChange('personalObligations', text)}
          multiline
          numberOfLines={3}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.personalObligations} 
          onSelectSuggestion={(suggestion) => handleInputChange('personalObligations', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: colors.text }]}>
          Any other factors we should consider when generating ideas for you?
        </Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., local regulations, disabilities, cultural considerations"
          placeholderTextColor={colors.text + '80'}
          value={formData.otherFactors}
          onChangeText={(text) => handleInputChange('otherFactors', text)}
          multiline
          numberOfLines={3}
        />
        <SuggestionChips 
          suggestions={SUGGESTIONS.otherFactors} 
          onSelectSuggestion={(suggestion) => handleInputChange('otherFactors', suggestion)} 
          colors={colors} 
        />
      </View>
      
      <View style={styles.finalNoteContainer}>
        <Ionicons name="information-circle" size={24} color={colors.primary} style={styles.infoIcon} />
        <Text style={[styles.finalNoteText, { color: colors.text }]}>
          We'll use this information to generate business ideas tailored specifically to you. The more details you provide, the better we can match ideas to your situation.
        </Text>
      </View>
    </View>
  );

  // Render current section content based on current index
  const renderCurrentSection = () => {
    switch (currentSection.id) {
      case SECTIONS.PERSONAL:
        return renderPersonalSection();
      case SECTIONS.GOALS:
        return renderGoalsSection();
      case SECTIONS.FINANCES:
        return renderFinancesSection();
      case SECTIONS.CONSTRAINTS:
        return renderConstraintsSection();
      case SECTIONS.MARKET:
        return renderMarketSection();
      case SECTIONS.APPROACH:
        return renderApproachSection();
      case SECTIONS.RESOURCES:
        return renderResourcesSection();
      case SECTIONS.PERSONAL_CONSTRAINTS:
        return renderPersonalConstraintsSection();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {renderProgressBar()}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderSectionHeader()}
        {renderCurrentSection()}
        
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton, { borderColor: colors.primary }]}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            styles.nextButton, 
            { backgroundColor: colors.primary },
            loading && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {currentSectionIndex < SECTION_DATA.length - 1 ? 'Next' : 'Generate Ideas'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Idea selection modal */}
      <IdeaSelectionModal
        visible={showIdeaSelection}
        ideas={generatedIdeas}
        onClose={() => {
          setShowIdeaSelection(false);
          // Reset form data immediately when closing modal
          setCurrentSectionIndex(0);
          setFormData({
            // Personal Background
            occupation: '',
            skills: [],
            interests: [],
            
            // Goals & Motivation
            businessReason: '',
            successVision: '',
            timeframe: '',
            
            // Finances & Budget
            budget: '',
            willingToSeekFunding: false,
            runway: '',
            
            // Practical Constraints
            hoursPerWeek: '',
            keepCurrentJob: false,
            location: '',
            canTravel: false,
            
            // Market & Customer Preferences
            preferredIndustry: '',
            industriesToAvoid: '',
            targetAudience: '',
            specificNiche: '',
            
            // Approach & Personality
            riskLevel: 'moderate',
            adaptability: false,
            teamApproach: 'solo',
            
            // Existing Resources & Networks
            existingTools: '',
            communitySupport: '',
            
            // Personal Constraints
            personalObligations: '',
            otherFactors: '',
          });
          setCurrentInput('');
        }}
        onSelectIdea={handleSelectIdea}
      />
    </KeyboardAvoidingView>
  );
};

export default CreateIdeaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    position: 'absolute',
    right: 10,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.8,
  },
  sectionContent: {
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  tagsScrollView: {
    flexDirection: 'row',
    marginBottom: 10,
    maxHeight: 50,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagText: {
    marginRight: 6,
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  radioGroupContainer: {
    marginVertical: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  finalNoteContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  finalNoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  nextButton: {
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  chipsScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationDisplay: {
    flex: 1,
    fontSize: 16,
  },
  locationHint: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 36,
  },
  modalScrollView: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  optionText: {
    fontSize: 14,
    marginRight: 4,
  },
  customLocationInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: 8,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 