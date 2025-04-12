import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import RNMapView from 'react-native-maps';
import { Heatmap, Marker as RNMarker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ENV } from '../../constants/env';

// Ensure Google Maps API key is set
const GOOGLE_MAPS_API_KEY = ENV?.MAPS?.GOOGLE_MAPS_API_KEY;
const isIOS = Platform.OS === 'ios';

// Export original components for direct use
export { Heatmap, PROVIDER_GOOGLE };

/**
 * iOS-compatible Marker component
 * 
 * On iOS, the react-native-maps Marker component has issues with children, custom props,
 * and some other features. This wrapper creates a simplified version for iOS to prevent
 * the "Cannot convert undefined value to object" error, while keeping full functionality
 * for Android.
 */
export const Marker = (props) => {
  // For iOS, use a very simple marker with minimal props
  if (Platform.OS === 'ios') {
    const { coordinate, title, description, pinColor, opacity, anchor, children } = props;
    
    // If children is provided and it's a custom marker (View), pass it through
    if (children && React.isValidElement(children)) {
      return (
        <RNMarker
          coordinate={coordinate}
          title={title || ''}
          description={description || ''}
          pinColor={pinColor}
          opacity={opacity}
          anchor={anchor}
        >
          {children}
        </RNMarker>
      );
    }
    
    // Otherwise use simple marker
    return (
      <RNMarker
        coordinate={coordinate}
        title={title || ''}
        description={description || ''}
        pinColor={pinColor}
        opacity={opacity}
        anchor={anchor}
      />
    );
  }
  
  // For Android, pass through all props
  return <RNMarker {...props} />;
};

/**
 * Platform-specific MapView component
 * 
 * Simplifies props on iOS to avoid compatibility issues, while
 * maintaining full functionality on Android.
 */
const MapViewComponent = (props) => {
  // On iOS, use a simpler prop set
  if (Platform.OS === 'ios') {
    const { style, initialRegion, children, zoomEnabled, zoomTapEnabled, minZoomLevel, maxZoomLevel } = props;
    return (
      <RNMapView
        style={style}
        initialRegion={initialRegion}
        zoomEnabled={zoomEnabled}
        zoomTapEnabled={zoomTapEnabled}
        minZoomLevel={minZoomLevel}
        maxZoomLevel={maxZoomLevel}
      >
        {children}
      </RNMapView>
    );
  }
  
  // For Android, pass all props
  return <RNMapView {...props} />;
};

export { MapViewComponent as MapView };
export default MapViewComponent; 