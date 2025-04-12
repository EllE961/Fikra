// src/screens/Ideas/IdeaDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { firestore } from '../../services/firebase';
import { useLoading } from '../../context/LoadingContext';

const IdeaDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [idea, setIdea] = useState(route.params?.idea || {});
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Set up navigation header
  useEffect(() => {
    navigation.setOptions({
      title: ' ', // Empty space instead of title
      headerRight: () => (
        <TouchableOpacity 
          style={{ marginRight: 16 }}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors.text]);
  
  // Add this helper function to update idea in Firestore
  const updateIdeaInFirestore = async (updatedIdea) => {
    if (!user) return;
    
    try {
      const ideaRef = firestore
        .collection('users')
        .doc(user.uid)
        .collection('ideas')
        .doc(updatedIdea.id);
      
      await ideaRef.update({
        ...updatedIdea,
        updatedAt: new Date()
      });
      console.log(`Successfully updated idea ${updatedIdea.id} in Firestore`);
    } catch (err) {
      console.error(`Error updating idea in Firestore: ${err.message}`);
      throw err; // Rethrow to handle in the calling function
    }
  };
  
  const handleUpdatePublicStatus = async (newValue) => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to update idea visibility.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Close the settings menu
    setSettingsVisible(false);
    
    // Update the local state first for immediate UI feedback
    setIdea(prevIdea => ({
      ...prevIdea,
      isPublic: newValue
    }));
    
    try {
      // Update the idea in Firestore
      await updateIdeaInFirestore({
        ...idea,
        isPublic: newValue
      });
    } catch (err) {
      console.error('Error updating idea visibility:', err);
      // Revert the local state if there was an error
      setIdea(prevIdea => ({
        ...prevIdea,
        isPublic: !newValue
      }));
      Alert.alert('Error', 'Failed to update idea visibility. Please try again.');
    }
  };

  const handleDeleteIdea = () => {
    // Close settings menu
    setSettingsVisible(false);

    // Different handling for web vs mobile
    if (Platform.OS === 'web' && typeof confirm === 'function') {
      // Web browser - use native confirm
      const shouldDelete = confirm("Are you sure you want to delete this idea? This cannot be undone.");
      if (shouldDelete) {
        confirmDeleteIdea();
      }
    } else {
      // React Native - use Alert
      Alert.alert(
        "Delete Idea",
        "Are you sure you want to delete this idea? This cannot be undone.",
        [
          { 
            text: "Cancel", 
            style: "cancel" 
          },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: confirmDeleteIdea
          }
        ],
        { cancelable: true }
      );
    }
  };

  const confirmDeleteIdea = async () => {
    if (!user || !idea || !idea.id) {
      Alert.alert('Error', 'Cannot delete idea: missing information');
      return;
    }

    try {
      // Start loading state for better UX
      startLoading('Deleting idea...');
      
      // Get a reference to the idea document in Firestore
      const ideaRef = firestore
        .collection('users')
        .doc(user.uid)
        .collection('ideas')
        .doc(idea.id);
      
      // Delete the idea
      await ideaRef.delete();
      
      // End loading
      stopLoading();
      
      console.log(`Successfully deleted idea ${idea.id} from Firestore`);
      
      // Show success message
      Alert.alert(
        'Success',
        'Your idea has been deleted.',
        [
          { 
            text: 'OK',
            onPress: () => {
              // Navigate to IdeasList screen instead of just going back
              navigation.navigate('IdeasStack', { 
                screen: 'IdeasList',
                params: { refreshIdeas: true }  // Force a refresh of the ideas list
              });
            }
          }
        ]
      );
    } catch (err) {
      console.error(`Error deleting idea: ${err.message}`);
      stopLoading();
      Alert.alert(
        'Error', 
        'Failed to delete idea. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Render the settings menu modal
  const renderSettingsMenu = () => (
    <Modal
      visible={settingsVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSettingsVisible(false)}
    >
      <TouchableOpacity 
        style={styles.settingsOverlay} 
        activeOpacity={1}
        onPress={() => setSettingsVisible(false)}
      >
        <View style={[styles.settingsMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>
            Idea Settings
          </Text>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleUpdatePublicStatus(!idea.isPublic)}
          >
            <View style={styles.settingsItemContent}>
              <Ionicons 
                name={idea.isPublic ? "eye-outline" : "eye-off-outline"} 
                size={22} 
                color={colors.primary} 
                style={styles.settingsIcon}
              />
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsItemTitle, { color: colors.text }]}>
                  {idea.isPublic ? "Make Private" : "Make Public"}
                </Text>
                <Text style={[styles.settingsItemDescription, { color: colors.text + '99' }]}>
                  {idea.isPublic 
                    ? "Currently visible on your profile" 
                    : "Currently only visible to you"}
                </Text>
              </View>
            </View>
            <Switch
              value={idea.isPublic || false}
              onValueChange={handleUpdatePublicStatus}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={idea.isPublic ? colors.primary : '#f4f3f4'}
            />
          </TouchableOpacity>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={handleDeleteIdea}
          >
            <View style={styles.settingsItemContent}>
              <Ionicons 
                name="trash-outline" 
                size={22} 
                color="#ff3b30" 
                style={styles.settingsIcon}
              />
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsItemTitle, { color: "#ff3b30" }]}>
                  Delete Idea
                </Text>
                <Text style={[styles.settingsItemDescription, { color: colors.text + '99' }]}>
                  Permanently remove this idea
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  
  if (!idea) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Idea not found
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Idea Header */}
      <View style={[styles.header, { backgroundColor: idea.color || colors.primary }]}>
        <Text style={styles.headerTitle}>{idea.title}</Text>
        {idea.isGenerated && (
          <View style={styles.tagContainer}>
            <Text style={styles.tag}>AI Generated</Text>
          </View>
        )}
        {/* Show the visibility status badge */}
        <View style={[styles.visibilityBadge, { backgroundColor: idea.isPublic ? 'rgba(0,200,0,0.3)' : 'rgba(0,0,0,0.3)' }]}>
          <Ionicons 
            name={idea.isPublic ? "eye-outline" : "eye-off-outline"} 
            size={14} 
            color="white" 
          />
          <Text style={styles.visibilityBadgeText}>
            {idea.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
      </View>
      
      {/* Idea Content */}
      <View style={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Description
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {idea.description}
        </Text>
        
        {/* Created timestamp */}
        {idea.generatedAt && (
          <Text style={[styles.timestamp, { color: colors.text + '99' }]}>
            Generated on {new Date(idea.generatedAt).toLocaleString()}
          </Text>
        )}
        
        {/* AI Chat Advisor Section */}
        <View style={[styles.chatAdvisorSection, { backgroundColor: colors.card }]}>
          <View style={styles.chatAdvisorContent}>
            <View style={styles.chatAdvisorIcon}>
              <Ionicons name="chatbubbles" size={32} color={colors.primary} />
            </View>
            <View style={styles.chatAdvisorTextContainer}>
              <Text style={[styles.chatAdvisorTitle, { color: colors.text }]}>
                AI Business Advisor
              </Text>
              <Text style={[styles.chatAdvisorDescription, { color: colors.text + 'CC' }]}>
                Chat with AI about your business idea, ask questions, and get personalized advice based on your specific situation.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.chatAdvisorButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('ChatAdvisor', { idea })}
          >
            <Text style={styles.chatAdvisorButtonText}>Start Chat</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Next Steps Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          Next Steps
        </Text>
        
        <View style={styles.nextStepsContainer}>
          <TouchableOpacity 
            style={[styles.nextStepButton, { borderColor: colors.border }]}
            onPress={() => {
              // Check if business model exists and navigate accordingly
              if (idea.businessModel && Object.values(idea.businessModel).some(value => value !== '')) {
                // Business model exists - navigate to visualization
                navigation.navigate('BusinessModelVisualization', { idea });
              } else {
                // Business model doesn't exist - navigate to creation screen
                navigation.navigate('BusinessModel', { idea });
              }
            }}
          >
            <Ionicons 
              name="business" 
              size={24} 
              color={colors.primary} 
              style={styles.nextStepIcon}
            />
            <View style={styles.nextStepContent}>
              <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                Create Business Model
              </Text>
              <Text style={[styles.nextStepDescription, { color: colors.text + '99' }]}>
                Define your business model canvas with AI assistance
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextStepButton, { borderColor: colors.border }]}
            onPress={() => {
              // Navigate to Marketing Tools
              navigation.navigate('MarketingTools', { idea });
            }}
          >
            <Ionicons 
              name="megaphone" 
              size={24} 
              color={colors.primary} 
              style={styles.nextStepIcon}
            />
            <View style={styles.nextStepContent}>
              <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                Marketing Tools <Text style={{fontSize: 12, color: colors.primary}}>COMING SOON</Text>
              </Text>
              <Text style={[styles.nextStepDescription, { color: colors.text + '99' }]}>
                Logos, social media content, and marketing strategies
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextStepButton, { borderColor: colors.border }]}
            onPress={() => {
              // Navigate to Market Analysis
              navigation.navigate('MarketAnalysisStack', { 
                screen: 'MarketAnalysisMain',
                params: { idea }
              });
            }}
          >
            <Ionicons 
              name="analytics" 
              size={24} 
              color={colors.primary} 
              style={styles.nextStepIcon}
            />
            <View style={styles.nextStepContent}>
              <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                Market Analysis
              </Text>
              <Text style={[styles.nextStepDescription, { color: colors.text + '99' }]}>
                Research competitors and identify optimal locations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Settings Menu Modal */}
      {renderSettingsMenu()}
    </ScrollView>
  );
};

export default IdeaDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    marginTop: 8,
  },
  tag: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  visibilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visibilityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
  },
  chatAdvisorSection: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  chatAdvisorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAdvisorIcon: {
    marginRight: 15,
  },
  chatAdvisorTextContainer: {
    flex: 1,
  },
  chatAdvisorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  chatAdvisorDescription: {
    fontSize: 13,
  },
  chatAdvisorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 12,
    alignSelf: 'center',
  },
  chatAdvisorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  nextStepsContainer: {
    marginTop: 10,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  nextStepIcon: {
    marginRight: 15,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  nextStepDescription: {
    fontSize: 13,
  },
  // Settings Menu Styles
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  settingsMenu: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingsItemContent: {
    flexDirection: 'row',
    flex: 1,
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
