import React from 'react';
import { View } from 'react-native';

// Mock components for web
const MapView = ({ children, style, ...props }) => (
  <View style={style}>
    {children}
  </View>
);

const Marker = ({ children }) => children || null;

const Heatmap = () => null;

const PROVIDER_GOOGLE = 'google';

export { MapView, Heatmap, Marker, PROVIDER_GOOGLE };

export default MapView; 