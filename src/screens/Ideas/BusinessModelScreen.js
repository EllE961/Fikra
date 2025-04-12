import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Animated,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { firestore } from '../../services/firebase';
import { useLoading } from '../../context/LoadingContext';
import { debounce } from 'lodash';

// Business model canvas section definitions with explanations
const CANVAS_SECTIONS = [
  {
    key: 'keyPartners',
    title: 'Key Partners',
    icon: 'people',
    description: 'Who are your key partners and suppliers? What resources are you acquiring from them?',
    placeholder: 'List your essential business partners, suppliers, and strategic alliances',
    examples: [
      'Suppliers and vendors',
      'Strategic alliances',
      'Joint ventures',
      'Co-marketing partners'
    ]
  },
  {
    key: 'keyActivities',
    title: 'Key Activities',
    icon: 'construct',
    description: 'What key activities does your value proposition require? What must you excel at?',
    placeholder: 'Describe the most important activities your business must perform to succeed',
    examples: [
      'Production',
      'Problem solving',
      'Platform/network',
      'Supply chain management'
    ]
  },
  {
    key: 'keyResources',
    title: 'Key Resources',
    icon: 'cube',
    description: 'What key resources does your value proposition require?',
    placeholder: 'List the assets and resources essential to make your business model work',
    examples: [
      'Physical (facilities, vehicles)',
      'Intellectual (patents, data)',
      'Human (talent, expertise)',
      'Financial (cash, credit)'
    ]
  },
  {
    key: 'valueProposition',
    title: 'Value Proposition',
    icon: 'star',
    description: 'What value do you deliver to customers? Which problems do you solve?',
    placeholder: 'Describe the products/services you offer and how they solve customer problems',
    examples: [
      'Newness',
      'Performance',
      'Customization',
      'Design',
      'Cost reduction',
      'Risk reduction'
    ]
  },
  {
    key: 'customerRelationships',
    title: 'Customer Relationships',
    icon: 'heart',
    description: 'What type of relationship does each customer segment expect?',
    placeholder: 'Explain how you will interact with and engage your customers',
    examples: [
      'Personal assistance',
      'Self-service',
      'Automated services',
      'Communities',
      'Co-creation'
    ]
  },
  {
    key: 'channels',
    title: 'Channels',
    icon: 'send',
    description: 'Through which channels do your customers want to be reached?',
    placeholder: 'Describe how you will communicate with and deliver value to customers',
    examples: [
      'Online platforms',
      'Physical stores',
      'Wholesalers',
      'Social media',
      'Direct sales'
    ]
  },
  {
    key: 'customerSegments',
    title: 'Customer Segments',
    icon: 'people-circle',
    description: 'For whom are you creating value? Who are your most important customers?',
    placeholder: 'Define the different groups of people or organizations you aim to reach and serve',
    examples: [
      'Mass market',
      'Niche market',
      'Segmented',
      'Diversified',
      'Multi-sided platform'
    ]
  },
  {
    key: 'costStructure',
    title: 'Cost Structure',
    icon: 'cash',
    description: 'What are the most important costs inherent in your business model?',
    placeholder: 'List your main expenses and how they relate to your resources and activities',
    examples: [
      'Fixed costs',
      'Variable costs',
      'Economies of scale',
      'Economies of scope'
    ]
  },
  {
    key: 'revenueStreams',
    title: 'Revenue Streams',
    icon: 'trending-up',
    description: 'For what value are your customers willing to pay? How do they prefer to pay?',
    placeholder: 'Describe how your business will make money and your pricing strategy',
    examples: [
      'Asset sale',
      'Subscription fees',
      'Licensing',
      'Advertising',
      'Usage fees'
    ]
  },
];

const BusinessModelScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  const [showIntro, setShowIntro] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'saved'
  
  const idea = route.params?.idea;
  
  // Business model canvas sections
  const [businessModel, setBusinessModel] = useState({
    keyPartners: idea?.businessModel?.keyPartners || '',
    keyActivities: idea?.businessModel?.keyActivities || '',
    keyResources: idea?.businessModel?.keyResources || '',
    valueProposition: idea?.businessModel?.valueProposition || '',
    customerRelationships: idea?.businessModel?.customerRelationships || '',
    channels: idea?.businessModel?.channels || '',
    customerSegments: idea?.businessModel?.customerSegments || '',
    costStructure: idea?.businessModel?.costStructure || '',
    revenueStreams: idea?.businessModel?.revenueStreams || '',
  });

  // Animation and UI state
  const [activeSection, setActiveSection] = useState(null);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [currentHelpSection, setCurrentHelpSection] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [animatedValue] = useState(new Animated.Value(0));
  
  // Update window dimensions when orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setWindowDimensions(window);
      }
    );
    return () => subscription?.remove();
  }, []);
  
  // Determine if we're on mobile based on width
  const isMobile = windowDimensions.width < 768;
  
  // Calculate completion percentage
  useEffect(() => {
    let completed = 0;
    let total = Object.keys(businessModel).length;
    
    Object.values(businessModel).forEach(value => {
      if (value && value.trim().length > 0) {
        completed++;
      }
    });
    
    setCompletionPercentage(Math.round((completed / total) * 100));
    
    // Animate progress bar
    Animated.timing(animatedValue, {
      toValue: completed / total,
      duration: 600,
      useNativeDriver: false
    }).start();
  }, [businessModel]);
  
  // Auto-save debounced function
  const debouncedSave = useCallback(
    debounce(async (modelToSave) => {
      if (!user || !idea || !idea.id) return;
      
      setSaveStatus('saving');
      
      try {
        const ideaRef = firestore
          .collection('users')
          .doc(user.uid)
          .collection('ideas')
          .doc(idea.id);
        
        await ideaRef.update({
          businessModel: modelToSave,
          updatedAt: new Date()
        });
        
        setSaveStatus('saved');
        
        // Reset save status after 3 seconds
        setTimeout(() => {
          setSaveStatus(null);
        }, 3000);
        
        // Show toast on Android
        if (Platform.OS === 'android') {
          ToastAndroid.show('Changes saved automatically', ToastAndroid.SHORT);
        }
      } catch (error) {
        console.error('Error auto-saving business model:', error);
        setSaveStatus(null);
      }
    }, 1500),
    [user, idea]
  );
  
  // Auto-save when model changes
  useEffect(() => {
    if (Object.values(businessModel).some(value => value.trim() !== '')) {
      debouncedSave(businessModel);
    }
  }, [businessModel, debouncedSave]);
  
  // Set up the navigation header
  useEffect(() => {
    navigation.setOptions({
      title: 'Business Model Canvas',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setHelpModalVisible(true)}
          >
            <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('BusinessModelVisualization', { idea })}
          >
            <Ionicons name="eye-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveBusinessModel}
          >
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Save</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, businessModel, idea, colors.primary]);
  
  // Update a specific section of the business model
  const updateSection = (section, value) => {
    setBusinessModel(prev => ({
      ...prev,
      [section]: value
    }));
  };
  
  // Save the business model to Firestore
  const saveBusinessModel = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save your business model.');
      return;
    }
    
    if (!idea || !idea.id) {
      Alert.alert('Error', 'No idea information found. Please try again.');
      return;
    }
    
    startLoading('Saving business model...');
    
    try {
      // Update the idea document with the business model
      const ideaRef = firestore
        .collection('users')
        .doc(user.uid)
        .collection('ideas')
        .doc(idea.id);
      
      await ideaRef.update({
        businessModel,
        updatedAt: new Date()
      });
      
      stopLoading();
      
      Alert.alert(
        'Success',
        'Your business model has been saved.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      stopLoading();
      console.error('Error saving business model:', error);
      Alert.alert('Error', 'Failed to save your business model. Please try again.');
    }
  };
  
  // Open help modal for a specific section
  const openSectionHelp = (section) => {
    setCurrentHelpSection(section);
    setHelpModalVisible(true);
  };
  
  // Render a text input section with label and help icon
  const renderSection = (sectionInfo) => {
    const isActive = activeSection === sectionInfo.key;
    const { key, title, icon, placeholder } = sectionInfo;
    
    return (
      <View 
        style={[
          styles.section, 
          { 
            borderColor: isActive ? colors.primary : colors.border,
            backgroundColor: isActive ? colors.card : colors.background,
            shadowColor: isActive ? colors.primary : 'transparent',
            shadowOpacity: isActive ? 0.2 : 0,
            shadowRadius: isActive ? 4 : 0,
            shadowOffset: { width: 0, height: 2 },
            elevation: isActive ? 3 : 0,
            ...(isMobile ? styles.sectionMobile : {}),
          }
        ]}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLabelContainer}>
            <Ionicons name={icon} size={20} color={isActive ? colors.primary : colors.text} style={styles.sectionIcon} />
            <Text style={[styles.sectionLabel, { color: isActive ? colors.primary : colors.text }]}>
              {title}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => openSectionHelp(sectionInfo)}
          >
            <View style={{ pointerEvents: 'auto' }}>
              <Ionicons name="information-circle-outline" size={20} color={colors.text + '99'} />
            </View>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[
            styles.textInput,
            { 
              color: colors.text, 
              borderColor: isActive ? colors.primary : colors.border, 
              backgroundColor: colors.card + '80',
              minHeight: isMobile ? 100 : 120,
            }
          ]}
          value={businessModel[key]}
          onChangeText={text => updateSection(key, text)}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '60'}
          multiline
          textAlignVertical="top"
          onFocus={() => setActiveSection(key)}
        />
        
        <View style={styles.statusRow}>
          {businessModel[key] ? (
            <View style={styles.completionIndicator}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={[styles.completionText, { color: colors.primary }]}>
                Completed
              </Text>
            </View>
          ) : (
            <View style={styles.completionIndicator}>
              <Ionicons name="ellipse-outline" size={16} color={colors.text + '60'} />
              <Text style={[styles.completionText, { color: colors.text + '60' }]}>
                Not completed
              </Text>
            </View>
          )}
          
          {saveStatus === 'saving' && activeSection === key && (
            <View style={styles.saveIndicator}>
              <Text style={[styles.saveText, { color: colors.text + '99' }]}>
                Saving...
              </Text>
            </View>
          )}
          
          {saveStatus === 'saved' && activeSection === key && (
            <View style={styles.saveIndicator}>
              <Ionicons name="checkmark" size={14} color={colors.primary} />
              <Text style={[styles.saveText, { color: colors.primary }]}>
                Saved
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  // Render a grid for desktop or list for mobile
  const renderCanvasLayout = () => {
    if (isMobile) {
      // Mobile layout - vertical list
      return (
        <View style={styles.mobileContainer}>
          {CANVAS_SECTIONS.map((section) => (
            <View key={section.key} style={styles.mobileSection}>
              {renderSection(section)}
            </View>
          ))}
        </View>
      );
    }
    
    // Desktop layout - grid
    return (
      <View style={styles.canvasContainer}>
        <View style={styles.canvasRow}>
          <View style={styles.leftColumn}>
            {renderSection(CANVAS_SECTIONS[0])}
          </View>
          <View style={styles.middleColumn}>
            <View style={styles.middleTop}>
              <View style={styles.activityResourcesColumn}>
                {renderSection(CANVAS_SECTIONS[1])}
                {renderSection(CANVAS_SECTIONS[2])}
              </View>
              <View style={styles.valuePropositionColumn}>
                {renderSection(CANVAS_SECTIONS[3])}
              </View>
              <View style={styles.relationshipsChannelsColumn}>
                {renderSection(CANVAS_SECTIONS[4])}
                {renderSection(CANVAS_SECTIONS[5])}
              </View>
            </View>
          </View>
          <View style={styles.rightColumn}>
            {renderSection(CANVAS_SECTIONS[6])}
          </View>
        </View>
        
        <View style={styles.bottomRow}>
          <View style={styles.costColumn}>
            {renderSection(CANVAS_SECTIONS[7])}
          </View>
          <View style={styles.revenueColumn}>
            {renderSection(CANVAS_SECTIONS[8])}
          </View>
        </View>
      </View>
    );
  };
  
  // Render the help modal
  const renderHelpModal = () => {
    if (!currentHelpSection) return null;
    
    return (
      <Modal
        visible={helpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setHelpModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Ionicons name={currentHelpSection.icon} size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {currentHelpSection.title}
              </Text>
              <TouchableOpacity 
                onPress={() => setHelpModalVisible(false)}
              >
                <View style={{ pointerEvents: 'auto' }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </View>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: colors.text }]}>
              {currentHelpSection.description}
            </Text>
            
            <Text style={[styles.examplesTitle, { color: colors.text }]}>
              Examples:
            </Text>
            
            <FlatList
              data={currentHelpSection.examples}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.exampleItem}>
                  <Ionicons name="checkmark" size={16} color={colors.primary} style={styles.exampleIcon} />
                  <Text style={[styles.exampleText, { color: colors.text }]}>
                    {item}
                  </Text>
                </View>
              )}
              style={styles.examplesList}
            />
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Insert an example into the text input
                const randomExample = currentHelpSection.examples[Math.floor(Math.random() * currentHelpSection.examples.length)];
                const currentText = businessModel[currentHelpSection.key] || '';
                const newText = currentText ? `${currentText}\n${randomExample}` : randomExample;
                updateSection(currentHelpSection.key, newText);
                setHelpModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Insert Example</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };
  
  // Intro modal to explain the purpose of the Business Model Canvas
  const renderIntroModal = () => {
    return (
      <Modal
        visible={showIntro}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIntro(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowIntro(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="business-outline" size={24} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Welcome to Business Model Canvas
              </Text>
              <TouchableOpacity 
                onPress={() => setShowIntro(false)}
              >
                <View style={{ pointerEvents: 'auto' }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </View>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalDescription, { color: colors.text }]}>
              The Business Model Canvas is a strategic management tool to define and communicate a business idea or concept effectively.
            </Text>
            
            <View style={styles.introStepContainer}>
              <View style={styles.introStep}>
                <Ionicons name="create-outline" size={24} color={colors.primary} style={styles.introStepIcon} />
                <View style={styles.introStepContent}>
                  <Text style={[styles.introStepTitle, { color: colors.text }]}>
                    Fill Each Section
                  </Text>
                  <Text style={[styles.introStepText, { color: colors.text + 'CC' }]}>
                    Complete all nine sections to define your complete business model. Click each section's info icon for guidance and examples.
                  </Text>
                </View>
              </View>
              
              <View style={styles.introStep}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} style={styles.introStepIcon} />
                <View style={styles.introStepContent}>
                  <Text style={[styles.introStepTitle, { color: colors.text }]}>
                    Use Section Help
                  </Text>
                  <Text style={[styles.introStepText, { color: colors.text + 'CC' }]}>
                    Click the info icon (ⓘ) next to each section title to see explanations and examples. You can insert examples directly into the canvas.
                  </Text>
                </View>
              </View>
              
              <View style={styles.introStep}>
                <Ionicons name="eye-outline" size={24} color={colors.primary} style={styles.introStepIcon} />
                <View style={styles.introStepContent}>
                  <Text style={[styles.introStepTitle, { color: colors.text }]}>
                    Switch to Visualization
                  </Text>
                  <Text style={[styles.introStepText, { color: colors.text + 'CC' }]}>
                    After filling in your canvas, switch to visualization mode to see your business model in a visual format.
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowIntro(false)}
            >
              <Text style={styles.modalButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Business Model for: {idea?.title || 'Your Business Idea'}
          </Text>
          <Text style={[styles.headerDescription, { color: colors.text + 'CC' }]}>
            A Business Model Canvas helps you define how your business creates, delivers, and captures value. Fill in all sections below or use AI to generate ideas.
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: colors.primary,
                    width: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {completionPercentage}% Complete
            </Text>
          </View>
          
          <View style={styles.tipsContainer}>
            <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="bulb-outline" size={24} color={colors.primary} style={styles.tipIcon} />
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>
                  Business Model Canvas Tips
                </Text>
                <Text style={[styles.tipDescription, { color: colors.text + 'CC' }]}>
                  • Click the info icon (ⓘ) next to each section for detailed explanations and examples
                </Text>
                <Text style={[styles.tipDescription, { color: colors.text + 'CC' }]}>
                  • Use the example button in each help section to insert sample content
                </Text>
                <Text style={[styles.tipDescription, { color: colors.text + 'CC' }]}>
                  • Complete all sections to get a comprehensive business model
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sectionNavigation}>
            <Text style={[styles.sectionNavigationTitle, { color: colors.text }]}>
              Jump to Section:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionNavScroll}>
              {CANVAS_SECTIONS.map((section) => (
                <TouchableOpacity 
                  key={section.key}
                  style={[
                    styles.sectionNavButton, 
                    { 
                      backgroundColor: businessModel[section.key] ? colors.primary + '20' : colors.card,
                      borderColor: businessModel[section.key] ? colors.primary : colors.border 
                    }
                  ]}
                  onPress={() => {
                    // Find the section in the DOM and scroll to it
                    setActiveSection(section.key);
                  }}
                >
                  <Ionicons 
                    name={section.icon} 
                    size={16} 
                    color={businessModel[section.key] ? colors.primary : colors.text + '99'} 
                    style={styles.sectionNavIcon} 
                  />
                  <Text 
                    style={[
                      styles.sectionNavText, 
                      { color: businessModel[section.key] ? colors.primary : colors.text + '99' }
                    ]}
                  >
                    {section.title}
                  </Text>
                  {businessModel[section.key] ? (
                    <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={styles.sectionNavCheck} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        {renderCanvasLayout()}
        
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            style={[styles.bottomButton, { backgroundColor: colors.primary }]}
            onPress={saveBusinessModel}
          >
            <Ionicons name="save-outline" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.generateButtonText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomButton, { backgroundColor: colors.primary + '99' }]}
            onPress={() => navigation.navigate('BusinessModelVisualization', { idea })}
          >
            <Ionicons name="eye-outline" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.generateButtonText}>Visualize</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {renderHelpModal()}
      {renderIntroModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  saveButton: {
    marginRight: 16,
    padding: 8,
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 70,
    textAlign: 'right',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiDescription: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  canvasContainer: {
    padding: 8,
  },
  canvasRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  leftColumn: {
    flex: 2,
    marginRight: 4,
  },
  middleColumn: {
    flex: 5,
  },
  middleTop: {
    flexDirection: 'row',
  },
  activityResourcesColumn: {
    flex: 1,
    marginRight: 4,
  },
  valuePropositionColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  relationshipsChannelsColumn: {
    flex: 1,
    marginLeft: 4,
  },
  rightColumn: {
    flex: 2,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
  },
  costColumn: {
    flex: 1,
    marginRight: 4,
  },
  revenueColumn: {
    flex: 1,
    marginLeft: 4,
  },
  // Mobile layout
  mobileContainer: {
    padding: 8,
  },
  mobileSection: {
    marginBottom: 12,
  },
  section: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  sectionMobile: {
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  completionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 13,
    marginLeft: 4,
  },
  saveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 13,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 10,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  examplesList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  exampleIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  exampleText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  introStepContainer: {
    marginBottom: 16,
  },
  introStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  introStepIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  introStepContent: {
    flex: 1,
  },
  introStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  introStepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 16,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  sectionNavigation: {
    marginBottom: 20,
  },
  sectionNavigationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionNavScroll: {
    flexDirection: 'row',
  },
  sectionNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  sectionNavIcon: {
    marginRight: 6,
  },
  sectionNavText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionNavCheck: {
    marginLeft: 4,
  },
});

export default BusinessModelScreen; 