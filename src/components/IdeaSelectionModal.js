import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Modal for selecting a business idea from a list of generated ideas
 * @param {Object} props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Array} props.ideas - Array of generated business ideas
 * @param {Function} props.onSelectIdea - Function to call when an idea is selected
 */
const IdeaSelectionModal = ({ visible, onClose, ideas = [], onSelectIdea }) => {
  const { colors } = useTheme();
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [makePublic, setMakePublic] = useState(false);

  const handleSelectIdea = (idea) => {
    setSelectedIdeaId(idea.id);
  };

  const handleConfirmSelection = () => {
    const selectedIdea = ideas.find(idea => idea.id === selectedIdeaId);
    if (selectedIdea) {
      onSelectIdea(selectedIdea, makePublic);
    }
  };

  // Add a confirmation dialog before closing
  const handleClose = () => {
    // For web compatibility, use a more direct approach
    // instead of relying on Alert which might behave differently
    if (typeof confirm === 'function' && Platform.OS === 'web') {
      // Web - use browser's native confirm dialog
      const shouldClose = confirm("Cancel Idea Selection? All generated ideas will be lost and you'll need to start over.");
      if (shouldClose) {
        if (typeof onClose === 'function') {
          onClose();
        }
      }
    } else {
      // Mobile - use React Native Alert
      Alert.alert(
        "Cancel Idea Selection?",
        "Are you sure? All generated ideas will be lost and you'll need to start over.",
        [
          { 
            text: "No, Keep Ideas", 
            style: "cancel" 
          },
          { 
            text: "Yes, Cancel", 
            onPress: () => {
              if (typeof onClose === 'function') {
                onClose();
              }
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  const renderIdeaItem = ({ item }) => {
    const isSelected = item.id === selectedIdeaId;
    
    return (
      <TouchableOpacity
        style={[
          styles.ideaItem,
          { borderColor: colors.border },
          isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
        ]}
        onPress={() => handleSelectIdea(item)}
      >
        <View style={[styles.ideaHeader, { borderBottomColor: colors.border }]}>
          <View style={[styles.ideaColorIndicator, { backgroundColor: item.color }]} />
          <Text style={[styles.ideaTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.selectedIcon} />
          )}
        </View>
        
        <Text style={[styles.ideaDescription, { color: colors.text }]}>
          {item.description}
        </Text>

        <View style={styles.ideaDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
              Challenge:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.challengeLevel || 'Moderate'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
              Cost:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.startupCosts || 'Unknown'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.text + '80' }]}>
              Profit Potential:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.profitPotential || 'Moderate'}
            </Text>
          </View>
        </View>
        
        {item.keyPoints && item.keyPoints.length > 0 && (
          <View style={styles.keyPointsContainer}>
            <Text style={[styles.keyPointsTitle, { color: colors.text }]}>
              Key Points:
            </Text>
            {item.keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPointItem}>
                <Ionicons name="checkmark" size={16} color={colors.primary} style={styles.keyPointIcon} />
                <Text style={[styles.keyPointText, { color: colors.text }]}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Choose Your Business Idea
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
          Select the idea you'd like to save to your portfolio
        </Text>
        
        <FlatList
          data={ideas}
          renderItem={renderIdeaItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
        
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.publicToggleContainer}>
            <Text style={[styles.publicToggleText, { color: colors.text }]}>
              Make idea public in profile
            </Text>
            <Switch
              value={makePublic}
              onValueChange={setMakePublic}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={makePublic ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, { opacity: !selectedIdeaId ? 0.5 : 1, backgroundColor: colors.primary }]}
            onPress={handleConfirmSelection}
            disabled={!selectedIdeaId}
          >
            <Text style={styles.buttonText}>Save Selected Idea</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  ideaItem: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  ideaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  ideaColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  ideaDescription: {
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  ideaDetails: {
    padding: 12,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
  },
  keyPointsContainer: {
    padding: 12,
    paddingTop: 0,
  },
  keyPointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  keyPointIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  keyPointText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  publicToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  publicToggleText: {
    fontSize: 16,
    marginRight: 10,
  },
});

export default IdeaSelectionModal; 