import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

/**
 * A universal loading overlay component for consistent loading UI across the app
 * @param {Object} props
 * @param {boolean} props.visible - Whether the loading overlay is visible
 * @param {string} props.message - Optional message to display below the spinner
 */
const LoadingOverlay = ({ visible, message = 'Loading...' }) => {
  // Try to get theme from NavigationContainer, but use default colors if not available
  let colors;
  try {
    colors = useTheme().colors;
  } catch (e) {
    // Fallback colors if theme is not available
    colors = {
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#000000',
      primary: '#5D5FEF',
    };
  }
  
  if (!visible) return null;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background + 'E6' }]}>
      <View style={[styles.loadingBox, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
    // Fixed shadow props deprecated warning by replacing with boxShadow
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  }
});

export default LoadingOverlay; 