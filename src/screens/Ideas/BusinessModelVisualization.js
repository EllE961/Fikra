import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BusinessModelVisualization = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [windowDimensions, setWindowDimensions] = React.useState(Dimensions.get('window'));
  
  const idea = route.params?.idea;
  const businessModel = idea?.businessModel || {};
  
  // Check if the business model is empty or incomplete
  const isModelEmpty = !businessModel || Object.values(businessModel).every(value => !value || value.trim() === '');
  
  // Navigate to edit screen if model is empty
  React.useEffect(() => {
    if (isModelEmpty) {
      navigation.replace('BusinessModelScreen', { idea });
    }
  }, [isModelEmpty, navigation, idea]);
  
  // Update window dimensions when orientation changes
  React.useEffect(() => {
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
  
  // Set up the navigation header
  React.useEffect(() => {
    navigation.setOptions({
      title: 'Business Model Canvas',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('BusinessModelScreen', { idea })}
          >
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, idea, colors.primary]);
  
  // Helper function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  // Render a block of the canvas
  const renderCanvasBlock = (title, content, icon, gradientColors) => {
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.canvasBlock}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.blockHeader}>
          <Ionicons name={icon} size={20} color="#fff" />
          <Text style={styles.blockTitle}>{title}</Text>
        </View>
        <View style={styles.blockContent}>
          <Text style={styles.blockText}>{truncateText(content, isMobile ? 80 : 150)}</Text>
        </View>
      </LinearGradient>
    );
  };
  
  if (isModelEmpty) {
    return null; // Will redirect to editing screen
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Business Model for: {idea?.title || 'Your Business Idea'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('BusinessModelScreen', { idea })}
          >
            <Ionicons name="create-outline" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.editButtonText}>Edit Business Model</Text>
          </TouchableOpacity>
        </View>
        
        {isMobile ? (
          // Mobile layout - Vertical
          <View style={styles.mobileCanvas}>
            {renderCanvasBlock('Key Partners', businessModel.keyPartners, 'people', ['#3498db', '#2980b9'])}
            {renderCanvasBlock('Key Activities', businessModel.keyActivities, 'construct', ['#9b59b6', '#8e44ad'])}
            {renderCanvasBlock('Key Resources', businessModel.keyResources, 'cube', ['#1abc9c', '#16a085'])}
            {renderCanvasBlock('Value Proposition', businessModel.valueProposition, 'star', ['#e74c3c', '#c0392b'])}
            {renderCanvasBlock('Customer Relationships', businessModel.customerRelationships, 'heart', ['#f1c40f', '#f39c12'])}
            {renderCanvasBlock('Channels', businessModel.channels, 'send', ['#2ecc71', '#27ae60'])}
            {renderCanvasBlock('Customer Segments', businessModel.customerSegments, 'people-circle', ['#e67e22', '#d35400'])}
            {renderCanvasBlock('Cost Structure', businessModel.costStructure, 'cash', ['#34495e', '#2c3e50'])}
            {renderCanvasBlock('Revenue Streams', businessModel.revenueStreams, 'trending-up', ['#2ecc71', '#27ae60'])}
          </View>
        ) : (
          // Desktop layout - Standard BMC layout
          <View style={styles.desktopCanvas}>
            <View style={styles.canvasTop}>
              <View style={styles.canvasTopLeft}>
                {renderCanvasBlock('Key Partners', businessModel.keyPartners, 'people', ['#3498db', '#2980b9'])}
              </View>
              
              <View style={styles.canvasTopMiddle}>
                <View style={styles.middleTop}>
                  <View style={styles.middleTopLeft}>
                    {renderCanvasBlock('Key Activities', businessModel.keyActivities, 'construct', ['#9b59b6', '#8e44ad'])}
                    {renderCanvasBlock('Key Resources', businessModel.keyResources, 'cube', ['#1abc9c', '#16a085'])}
                  </View>
                  
                  <View style={styles.middleTopCenter}>
                    {renderCanvasBlock('Value Proposition', businessModel.valueProposition, 'star', ['#e74c3c', '#c0392b'])}
                  </View>
                  
                  <View style={styles.middleTopRight}>
                    {renderCanvasBlock('Customer Relationships', businessModel.customerRelationships, 'heart', ['#f1c40f', '#f39c12'])}
                    {renderCanvasBlock('Channels', businessModel.channels, 'send', ['#2ecc71', '#27ae60'])}
                  </View>
                </View>
              </View>
              
              <View style={styles.canvasTopRight}>
                {renderCanvasBlock('Customer Segments', businessModel.customerSegments, 'people-circle', ['#e67e22', '#d35400'])}
              </View>
            </View>
            
            <View style={styles.canvasBottom}>
              <View style={styles.canvasBottomLeft}>
                {renderCanvasBlock('Cost Structure', businessModel.costStructure, 'cash', ['#34495e', '#2c3e50'])}
              </View>
              <View style={styles.canvasBottomRight}>
                {renderCanvasBlock('Revenue Streams', businessModel.revenueStreams, 'trending-up', ['#2ecc71', '#27ae60'])}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  header: {
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Mobile canvas
  mobileCanvas: {
    padding: 8,
  },
  // Desktop canvas
  desktopCanvas: {
    padding: 8,
  },
  canvasTop: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  canvasTopLeft: {
    flex: 2,
    marginRight: 4,
  },
  canvasTopMiddle: {
    flex: 5,
  },
  middleTop: {
    flexDirection: 'row',
  },
  middleTopLeft: {
    flex: 1,
    marginRight: 4,
  },
  middleTopCenter: {
    flex: 1,
    marginHorizontal: 4,
  },
  middleTopRight: {
    flex: 1,
    marginLeft: 4,
  },
  canvasTopRight: {
    flex: 2,
    marginLeft: 4,
  },
  canvasBottom: {
    flexDirection: 'row',
  },
  canvasBottomLeft: {
    flex: 1,
    marginRight: 4,
  },
  canvasBottomRight: {
    flex: 1,
    marginLeft: 4,
  },
  // Canvas block
  canvasBlock: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  blockContent: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 80,
  },
  blockText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});

export default BusinessModelVisualization; 