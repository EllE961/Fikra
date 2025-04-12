import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ENV } from '../../constants/env';
import { MapView, Heatmap, Marker, PROVIDER_GOOGLE } from '../../components/map/MapView';

// Placeholder for the data service - would be replaced with actual API calls
const LocationDataService = {
  // Simulate fetching data based on location
  getHeatmapDataForLocation: async (location, businessType) => {
    // In a real implementation, this would call a backend API
    // For this demo, we'll generate simulated data based on the city
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use the city coordinates as a seed to generate consistent data
    const { latitude, longitude } = location;
    
    // Create points distributed around the location with varying weights
    const points = [];
    
    // Check if this is Halifax (based on coordinates)
    const isHalifax = Math.abs(latitude - 44.6476) < 0.05 && Math.abs(longitude - (-63.5728)) < 0.05;
    
    // Check if this is Muscat (based on coordinates)
    const isMuscat = Math.abs(latitude - 23.5880) < 0.05 && Math.abs(longitude - 58.3829) < 0.05;
    
    if (isHalifax) {
      // Use Halifax-specific data
      generateHalifaxData(points, businessType);
    } else if (isMuscat) {
      // Use Muscat-specific data
      generateMuscatData(points, businessType);
    } else {
      // For other cities, use generic city patterns but try to avoid water
      generateGenericCityData(points, latitude, longitude, businessType);
    }
    
    // Find the best location (highest weight)
    const bestLocation = points.reduce((best, current) => 
      current.weight > best.weight ? current : best, 
      { weight: 0 }
    );
    
    return {
      points,
      center: { latitude, longitude },
      bestLocation
    };
  },
  
  // Get city suggestions based on partial input using geocoding API
  getCitySuggestions: async (partialName) => {
    if (!partialName || partialName.length < 2) return [];
    
    try {
      // Use Location.geocodeAsync which is built into Expo
      const geocodingResults = await Location.geocodeAsync(partialName);
      
      // In case Location.geocodeAsync fails or doesn't return good results,
      // we can fall back to a direct API call
      if (!geocodingResults || geocodingResults.length === 0) {
        return await fetchGeocodingResults(partialName);
      }
      
      // Transform the geocode results to our expected format
      return geocodingResults.slice(0, 10).map(result => ({
        name: result.name || `${result.city || result.region || result.country || partialName}`,
        coords: {
          latitude: result.latitude,
          longitude: result.longitude
        }
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fall back to direct API call if expo geocoding fails
      return await fetchGeocodingResults(partialName);
    }
  }
};

// Fallback function to fetch geocoding results using a third-party API
async function fetchGeocodingResults(searchText) {
  try {
    // Using OpenStreetMap's Nominatim API as it's free and doesn't require an API key
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=10`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'FikraApp/1.0' // Required by Nominatim's terms of use
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    // Transform the Nominatim results to our expected format
    return data.map(item => ({
      name: item.display_name,
      coords: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }
    }));
  } catch (error) {
    console.error('Nominatim API error:', error);
    // Return empty array in case of errors
    return [];
  }
}

// Business type options
const BUSINESS_TYPES = [
  { id: 'retail', label: 'Retail Store' },
  { id: 'restaurant', label: 'Restaurant/Café' },
  { id: 'professional', label: 'Professional Services' },
  { id: 'entertainment', label: 'Entertainment' },
];

// Create retail pattern - concentrated downtown with commercial strips
function createRetailPattern(points, centerLat, centerLng, seededRandom = Math.random, isOnLandCheck = null) {
  // Retail concentrates around:
  // 1. Downtown retail corridors
  // 2. Shopping malls/centers
  // 3. Main commercial streets
  // 4. Neighborhood retail nodes
  
  // Downtown main retail corridor (the most valuable retail area)
  const downtownOffset = 0.001; // Slight offset from exact city center
  const downtownCoreLat = centerLat + downtownOffset;
  const downtownCoreLng = centerLng - downtownOffset;
  
  // Main shopping street - tight cluster with high weights
  for (let i = 0; i < 12; i++) {
    // Create a line of high-value points along the main shopping street
    const offset = (i - 6) * 0.0008;
    const lat = downtownCoreLat;
    const lng = downtownCoreLng + offset;
    
    // Add small jitter to avoid perfectly straight lines
    const latJitter = (seededRandom() - 0.5) * 0.0002;
    const lngJitter = (seededRandom() - 0.5) * 0.0002;
    const finalLat = lat + latJitter;
    const finalLng = lng + lngJitter;
    
    // Higher weights in the center of downtown
    const distFromCenter = Math.abs(offset);
    const weight = 90 - (distFromCenter * 3000);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(finalLat, finalLng)) {
      continue;
    }
    
    points.push({
      latitude: finalLat,
      longitude: finalLng,
      weight,
    });
  }
  
  // Secondary downtown streets (cross streets near main retail corridor)
  for (let i = 0; i < 8; i++) {
    // Create retail points along perpendicular streets
    const offset = (i - 4) * 0.0007;
    const lat = downtownCoreLat + offset;
    const lng = downtownCoreLng + (Math.cos(i) * 0.0004); // Small variation
    
    // Slightly lower weights than main street
    const weight = 75 - Math.abs(offset * 2000);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Major commercial strips (2-3 main roads leading out from center)
  const mainRoads = 3;
  for (let road = 0; road < mainRoads; road++) {
    // Create roads at different angles from downtown
    const angle = (road / mainRoads) * Math.PI * 2;
    
    // Each road has multiple retail spots with decreasing weights
    for (let i = 0; i < 10; i++) {
      const distance = 0.004 + (i * 0.0015); // Increasing distance from center
      const lat = centerLat + Math.sin(angle) * distance;
      const lng = centerLng + Math.cos(angle) * distance;
      
      // Skip this point if not on land (when check is provided)
      if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
        continue;
      }
      
      // Decreasing weight as we move away from downtown
      const weight = 70 - (i * 5);
      
      points.push({
        latitude: lat,
        longitude: lng,
        weight,
      });
    }
  }
  
  // Shopping malls/centers (2-3 high-value clusters)
  for (let mall = 0; mall < 2; mall++) {
    // Place malls in different directions from downtown
    const mallAngle = (mall / 2) * Math.PI + 0.5; // Offset them from the main roads
    const mallDistance = 0.015 + (mall * 0.003); // Away from downtown
    const mallLat = centerLat + Math.sin(mallAngle) * mallDistance;
    const mallLng = centerLng + Math.cos(mallAngle) * mallDistance;
    
    // Each mall is a tight cluster of retail
    for (let i = 0; i < 6; i++) {
      const storeAngle = (i / 6) * Math.PI * 2;
      const storeDistance = 0.0008; // Tight cluster
      const lat = mallLat + Math.sin(storeAngle) * storeDistance;
      const lng = mallLng + Math.cos(storeAngle) * storeDistance;
      
      // Skip this point if not on land (when check is provided)
      if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
        continue;
      }
      
      // Mall anchor stores have high value
      const weight = 80 - (mall * 10); // First mall is higher value
      
      points.push({
        latitude: lat,
        longitude: lng,
        weight,
      });
    }
  }
  
  // Neighborhood retail nodes (smaller clusters in residential areas)
  for (let neighborhood = 0; neighborhood < 5; neighborhood++) {
    const nodeAngle = (neighborhood / 5) * Math.PI * 2;
    // Place these further out in suburban areas
    const nodeDistance = 0.02 + (neighborhood * 0.002);
    const nodeLat = centerLat + Math.sin(nodeAngle) * nodeDistance;
    const nodeLng = centerLng + Math.cos(nodeAngle) * nodeDistance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(nodeLat, nodeLng)) {
      continue;
    }
    
    // Small cluster of stores
    for (let i = 0; i < 4; i++) {
      const storeAngle = (i / 4) * Math.PI * 2;
      const storeDistance = 0.001;
      const lat = nodeLat + Math.sin(storeAngle) * storeDistance;
      const lng = nodeLng + Math.cos(storeAngle) * storeDistance;
      
      // Skip this point if not on land (when check is provided)
      if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
        continue;
      }
      
      // Lower weights in neighborhood centers
      const weight = 55 - (nodeDistance * 800);
      
      points.push({
        latitude: lat,
        longitude: lng,
        weight,
      });
    }
  }
}

// Create restaurant pattern - concentrated in entertainment districts and small clusters
function createRestaurantPattern(points, centerLat, centerLng, seededRandom = Math.random, isOnLandCheck = null) {
  // Restaurants cluster in:
  // 1. Restaurant rows / dining districts
  // 2. Downtown near offices (lunch crowds)
  // 3. Near entertainment venues
  // 4. Neighborhood centers
  // 5. Along main roads
  
  // Restaurant row / dining district (highest value)
  const districtLat = centerLat + 0.003;
  const districtLng = centerLng - 0.002;
  
  // Main restaurant strip - lots of places together
  for (let i = 0; i < 15; i++) {
    const offset = (i - 7) * 0.0008;
    const lat = districtLat;
    const lng = districtLng + offset;
    
    // Higher concentration in the middle of the district
    const distFromCenter = Math.abs(offset);
    const weight = 90 - (distFromCenter * 3000);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Side streets near restaurant row
  for (let i = 0; i < 6; i++) {
    const offset = (i - 3) * 0.0006;
    const lat = districtLat + offset;
    const lng = districtLng + (Math.sin(i) * 0.0008);
    
    // Good but not prime locations
    const weight = 75 - (Math.abs(offset) * 3000);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Downtown lunch spots (near office buildings)
  const downtownLat = centerLat - 0.001;
  const downtownLng = centerLng + 0.001;
  
  for (let i = 0; i < 12; i++) {
    // Scatter around downtown business district
    const row = Math.floor(i / 4);
    const col = i % 4;
    
    const lat = downtownLat + (row * 0.0008);
    const lng = downtownLng + (col * 0.0008);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Good weights - lunch crowds
    const weight = 70 - (seededRandom() * 10);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Near entertainment venues (theater district, etc.)
  const entertainmentLat = centerLat + 0.008;
  const entertainmentLng = centerLng + 0.005;
  
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 0.002;
    const lat = entertainmentLat + Math.sin(angle) * distance;
    const lng = entertainmentLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // High values - pre/post entertainment dining
    const weight = 80 - (seededRandom() * 10);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Neighborhood restaurant clusters (multiple neighborhoods)
  for (let n = 0; n < 5; n++) {
    const angle = (n / 5) * Math.PI * 2;
    const distance = 0.015 + (n * 0.002);
    const neighborhoodLat = centerLat + Math.sin(angle) * distance;
    const neighborhoodLng = centerLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(neighborhoodLat, neighborhoodLng)) {
      continue;
    }
    
    // Small cluster in each neighborhood
    for (let i = 0; i < 4; i++) {
      const localAngle = (i / 4) * Math.PI * 2;
      const localDistance = 0.0006;
      const lat = neighborhoodLat + Math.sin(localAngle) * localDistance;
      const lng = neighborhoodLng + Math.cos(localAngle) * localDistance;
      
      // Skip this point if not on land (when check is provided)
      if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
        continue;
      }
      
      // Lower weights in neighborhoods
      const weight = 60 - (distance * 1000);
      
      points.push({
        latitude: lat,
        longitude: lng,
        weight,
      });
    }
  }
  
  // Along major roads (individual restaurants)
  for (let road = 0; road < 3; road++) {
    const roadAngle = (road / 3) * Math.PI * 2;
    
    for (let i = 0; i < 6; i++) {
      const distance = 0.008 + (i * 0.003);
      const lat = centerLat + Math.sin(roadAngle) * distance;
      const lng = centerLng + Math.cos(roadAngle) * distance;
      
      // Skip this point if not on land (when check is provided)
      if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
        continue;
      }
      
      // Lower values for roadside restaurants
      const weight = 50 - (i * 3);
      
      points.push({
        latitude: lat,
        longitude: lng,
        weight,
      });
    }
  }
}

// Create professional services pattern - business districts and office parks
function createProfessionalPattern(points, centerLat, centerLng, seededRandom = Math.random, isOnLandCheck = null) {
  // Professional services cluster in:
  // 1. Central Business District (CBD)
  // 2. Office parks/campuses
  // 3. Medical districts/hospitals
  // 4. Government centers
  // 5. Suburban office nodes
  
  // Central Business District - dense office cluster (highest values)
  const cbdLat = centerLat - 0.001;
  const cbdLng = centerLng + 0.002;
  
  // Create a grid of office buildings
  for (let i = 0; i < 16; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    
    const lat = cbdLat + (row * 0.0008);
    const lng = cbdLng + (col * 0.0008);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Calculate distance from CBD center
    const distFromCenter = Math.sqrt(
      Math.pow(lat - cbdLat - 0.0012, 2) + 
      Math.pow(lng - cbdLng - 0.0012, 2)
    );
    
    // Prime office spaces in center of CBD
    const weight = 95 - (distFromCenter * 5000);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Office Park / Business Campus (often near highways)
  const parkLat = centerLat + 0.012;
  const parkLng = centerLng - 0.008;
  
  // Campus-like layout
  for (let i = 0; i < 12; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    
    const lat = parkLat + (row * 0.001);
    const lng = parkLng + (col * 0.001);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Good but not as prime as downtown
    const weight = 80 - (seededRandom() * 10);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Medical District / Hospital Area (specialized professional services)
  const medicalLat = centerLat - 0.008;
  const medicalLng = centerLng - 0.005;
  
  // Hospital and medical offices
  for (let i = 0; i < 10; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    
    const lat = medicalLat + (row * 0.0008);
    const lng = medicalLng + (col * 0.0008);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // High values for medical offices
    const weight = 85 - (seededRandom() * 10);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Government Center / Civic District
  const govLat = centerLat + 0.003;
  const govLng = centerLng + 0.006;
  
  // Government buildings and related services
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 0.002;
    const lat = govLat + Math.sin(angle) * distance;
    const lng = govLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Strong but not top tier
    const weight = 75 - (seededRandom() * 10);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Suburban Office Nodes (smaller, scattered)
  for (let n = 0; n < 4; n++) {
    const angle = (n / 4) * Math.PI * 2;
    const distance = 0.018 + (n * 0.003);
    const nodeLat = centerLat + Math.sin(angle) * distance;
    const nodeLng = centerLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(nodeLat, nodeLng)) {
      continue;
    }
    
    // Small office clusters
    for (let i = 0; i < 5; i++) {
      const localAngle = (i / 5) * Math.PI * 2;
      const localDistance = 0.001;
      const lat = nodeLat + Math.sin(localAngle) * localDistance;
      const lng = nodeLng + Math.cos(localAngle) * localDistance;
      
      // Skip this point if not on land (when check is provided)
      if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
        continue;
      }
      
      // Lower values in suburbs
      const weight = 60 - (distance * 800);
      
      points.push({
        latitude: lat,
        longitude: lng,
        weight,
      });
    }
  }
  
  // Scattered professional offices (accountants, lawyers in mixed-use areas)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 0.01 + (i * 0.001);
    const lat = centerLat + Math.sin(angle) * distance;
    const lng = centerLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Lower weights for these
    const weight = 50 - (distance * 500);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
}

// Create entertainment pattern - few concentrated clusters
function createEntertainmentPattern(points, centerLat, centerLng, seededRandom = Math.random, isOnLandCheck = null) {
  // Entertainment venues cluster in:
  // 1. Downtown entertainment district
  // 2. Theater/arts district
  // 3. Sports complex/arena
  // 4. Tourist areas
  // 5. Casino/gaming zones (if applicable)
  
  // Main downtown entertainment district
  const mainLat = centerLat + 0.003;
  const mainLng = centerLng - 0.001;
  
  // Concentrated cluster of entertainment venues
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 0.002 * Math.sqrt(seededRandom());
    const lat = mainLat + Math.sin(angle) * distance;
    const lng = mainLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // High weights in entertainment district
    const weight = 90 - (distance * 800);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Theater/Arts District
  const artsLat = centerLat - 0.004;
  const artsLng = centerLng + 0.003;
  
  // Line of theaters/venues
  for (let i = 0; i < 8; i++) {
    const offset = (i - 4) * 0.001;
    const lat = artsLat;
    const lng = artsLng + offset;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Good weights for arts district
    const weight = 80 - (Math.abs(offset) * 2000);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Sports Complex / Stadium Area
  const sportsLat = centerLat - 0.01;
  const sportsLng = centerLng + 0.008;
  
  // Stadium and surrounding entertainment
  points.push({
    latitude: sportsLat,
    longitude: sportsLng,
    weight: 85, // Stadium itself is high value
  });
  
  // Entertainment venues around stadium
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const distance = 0.003;
    const lat = sportsLat + Math.sin(angle) * distance;
    const lng = sportsLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Good weights near stadium
    const weight = 75 - (seededRandom() * 10);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Tourist Area / Attraction Zone
  const touristLat = centerLat + 0.008;
  const touristLng = centerLng + 0.006;
  
  // Tourist attractions and entertainment
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const distance = 0.003 * Math.random();
    const lat = touristLat + Math.sin(angle) * distance;
    const lng = touristLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Good weights in tourist areas
    const weight = 75 - (distance * 1000);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Waterfront/Marina Entertainment (if applicable)
  const waterLat = centerLat + 0.015;
  const waterLng = centerLng - 0.012;
  
  // Entertainment along a waterfront/marina
  for (let i = 0; i < 8; i++) {
    const offset = (i - 4) * 0.001;
    const lat = waterLat;
    const lng = waterLng + offset;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Good but not top tier
    const weight = 70 - (Math.abs(offset) * 1000);
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Casino/Gaming zone (single high-value point)
  if (seededRandom() > 0.3) { // Not all cities have casinos
    const casinoLat = centerLat - 0.007;
    const casinoLng = centerLng - 0.009;
    
    points.push({
      latitude: casinoLat,
      longitude: casinoLng,
      weight: 88, // High value for casino
    });
  }
}

// Generate Halifax-specific data based on the actual layout of the city
function generateHalifaxData(points, businessType) {
  // Key areas in Halifax
  const downtown = { latitude: 44.6488, longitude: -63.5752 };
  const downtownDartmouth = { latitude: 44.6658, longitude: -63.5669 };
  const northEnd = { latitude: 44.6583, longitude: -63.5872 };
  const southEnd = { latitude: 44.6388, longitude: -63.5722 };
  const springGarden = { latitude: 44.6423, longitude: -63.5757 };
  const quinpool = { latitude: 44.6447, longitude: -63.5908 };
  const bedford = { latitude: 44.7340, longitude: -63.6569 };
  const bayers = { latitude: 44.6563, longitude: -63.6250 };
  
  // Known land coordinates to avoid water
  const halifaxPeninsulaBoundary = {
    north: 44.68,
    south: 44.61,
    east: -63.54,
    west: -63.62
  };
  
  // Define retail hotspots for Halifax
  if (businessType === 'retail') {
    // Spring Garden Road - main retail corridor
    generatePointsAlongRoad(points, 
      springGarden.latitude, springGarden.longitude,
      springGarden.latitude, springGarden.longitude - 0.008,
      15, 80, 90);
    
    // Downtown Halifax
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.005, 12, 70, 85);
    
    // Scotia Square / Halifax Shopping Centre
    generatePointsInArea(points, 44.6486, -63.5769, 0.002, 8, 80, 90);
    
    // Quinpool Road commercial area
    generatePointsAlongRoad(points,
      quinpool.latitude, quinpool.longitude,
      quinpool.latitude - 0.001, quinpool.longitude + 0.008,
      10, 60, 75);
    
    // Dartmouth Crossing shopping area
    generatePointsInArea(points, 44.6915, -63.5391, 0.007, 15, 75, 85);
    
    // Bayers Lake Business Park
    generatePointsInArea(points, bayers.latitude, bayers.longitude, 0.008, 12, 70, 80);
    
    // Bedford Place Mall area
    generatePointsInArea(points, bedford.latitude, bedford.longitude, 0.005, 8, 65, 75);
  }
  
  // Define restaurant hotspots for Halifax
  else if (businessType === 'restaurant') {
    // Argyle Street restaurant district
    generatePointsAlongRoad(points,
      44.6467, -63.5743,
      44.6486, -63.5755,
      12, 80, 95);
    
    // Spring Garden Road restaurants
    generatePointsAlongRoad(points,
      springGarden.latitude, springGarden.longitude,
      springGarden.latitude, springGarden.longitude - 0.007,
      10, 75, 85);
    
    // Quinpool Road restaurants
    generatePointsAlongRoad(points,
      quinpool.latitude, quinpool.longitude,
      quinpool.latitude, quinpool.longitude + 0.009,
      12, 70, 80);
    
    // Waterfront restaurants (avoid harbor)
    generatePointsAlongRoad(points,
      44.6510, -63.5712,
      44.6440, -63.5697,
      8, 75, 90);
    
    // North End restaurants (Gottingen/Agricola)
    generatePointsAlongRoad(points,
      44.6511, -63.5828,
      44.6570, -63.5878,
      10, 65, 80);
    
    // Dartmouth restaurants
    generatePointsInArea(points, downtownDartmouth.latitude, downtownDartmouth.longitude, 0.004, 10, 60, 75);
  }
  
  // Define professional services areas for Halifax
  else if (businessType === 'professional') {
    // Downtown business district - Purdy's Wharf/Scotia Square
    generatePointsInArea(points, 44.6500, -63.5730, 0.003, 20, 85, 95);
    
    // Spring Garden Road professional offices
    generatePointsAlongRoad(points,
      springGarden.latitude, springGarden.longitude,
      springGarden.latitude, springGarden.longitude - 0.007,
      8, 75, 85);
    
    // Dartmouth professional services
    generatePointsInArea(points, downtownDartmouth.latitude, downtownDartmouth.longitude, 0.004, 10, 65, 80);
    
    // Bayers Lake business park
    generatePointsInArea(points, bayers.latitude, bayers.longitude, 0.008, 15, 70, 85);
    
    // Bedford professional offices
    generatePointsInArea(points, bedford.latitude, bedford.longitude, 0.006, 10, 60, 75);
    
    // Hospital district (VG/IWK/QEII)
    generatePointsInArea(points, 44.6390, -63.5820, 0.004, 15, 80, 90);
  }
  
  // Define entertainment venues for Halifax
  else if (businessType === 'entertainment') {
    // Argyle Street entertainment district
    generatePointsInArea(points, 44.6476, -63.5752, 0.002, 8, 85, 95);
    
    // Casino Nova Scotia
    addSinglePoint(points, 44.6519, -63.5722, 90);
    
    // Scotiabank Centre/Metro Centre
    addSinglePoint(points, 44.6486, -63.5767, 88);
    
    // Neptune Theatre
    addSinglePoint(points, 44.6458, -63.5732, 85);
    
    // Halifax Citadel National Historic Site
    addSinglePoint(points, 44.6478, -63.5804, 80);
    
    // Waterfront entertainment
    generatePointsAlongRoad(points,
      44.6510, -63.5712,
      44.6440, -63.5697,
      6, 70, 85);
    
    // Lower Deck/Historic Properties
    generatePointsInArea(points, 44.6483, -63.5725, 0.001, 4, 80, 90);
    
    // North End entertainment
    generatePointsInArea(points, northEnd.latitude, northEnd.longitude, 0.004, 6, 60, 75);
  }
  
  // Generic retail as a fallback
  else {
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.005, 15, 70, 90);
    generatePointsAlongRoad(points,
      springGarden.latitude, springGarden.longitude,
      springGarden.latitude, springGarden.longitude - 0.007,
      10, 75, 85);
  }
}

// Generate points along a road (between two coordinates) with optional land check
function generatePointsAlongRoad(points, startLat, startLng, endLat, endLng, count, minWeight, maxWeight, isOnLandCheck = null) {
  // First add core points along the road
  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1);
    const lat = startLat + ratio * (endLat - startLat);
    const lng = startLng + ratio * (endLng - startLng);
    
    // Add reduced jitter for core points
    const latJitter = (Math.random() - 0.5) * 0.0002;
    const lngJitter = (Math.random() - 0.5) * 0.0002;
    
    const finalLat = lat + latJitter;
    const finalLng = lng + lngJitter;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(finalLat, finalLng)) {
      continue;
    }
    
    // Weight is highest in the middle of the road (bell curve distribution)
    const distFromMiddle = Math.abs(ratio - 0.5) * 2; // 0 at middle, 1 at ends
    const weight = maxWeight - (distFromMiddle * (maxWeight - minWeight) * 0.6); // Reduced falloff
    
    points.push({
      latitude: finalLat,
      longitude: finalLng,
      weight,
    });
  }
  
  // Now add additional points spreading outward from the road for broader effect
  // Calculate road direction vector
  const roadVectorLat = endLat - startLat;
  const roadVectorLng = endLng - startLng;
  const roadLength = Math.sqrt(roadVectorLat * roadVectorLat + roadVectorLng * roadVectorLng);
  
  // Normalize the vector
  const normalizedVectorLat = roadVectorLat / roadLength;
  const normalizedVectorLng = roadVectorLng / roadLength;
  
  // Perpendicular vector (rotate 90 degrees)
  const perpVectorLat = -normalizedVectorLng;
  const perpVectorLng = normalizedVectorLat;
  
  // Add points on both sides of the road with distance falloff
  for (let i = 0; i < count * 1.5; i++) {
    const ratio = Math.random(); // Position along the road
    const baseLat = startLat + ratio * roadVectorLat;
    const baseLng = startLng + ratio * roadVectorLng;
    
    // Distance from road (higher for wider effect)
    const distance = 0.0005 + (Math.random() * 0.002); 
    
    // Randomly choose side of road (positive or negative perpendicular direction)
    const side = Math.random() > 0.5 ? 1 : -1;
    
    // Calculate final position
    const finalLat = baseLat + (perpVectorLat * distance * side);
    const finalLng = baseLng + (perpVectorLng * distance * side);
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(finalLat, finalLng)) {
      continue;
    }
    
    // Weight decreases with distance from road
    const weight = minWeight + ((1 - (distance / 0.0025)) * (maxWeight - minWeight) * 0.5);
    
    points.push({
      latitude: finalLat,
      longitude: finalLng,
      weight,
    });
  }
}

// Generate points in an area (circular cluster) with optional land check
function generatePointsInArea(points, centerLat, centerLng, radius, count, minWeight, maxWeight, isOnLandCheck = null) {
  // Create a high-weight center point first for the cluster core
  points.push({
    latitude: centerLat,
    longitude: centerLng,
    weight: maxWeight,
  });
  
  // Create two layers of points - closer and further from center
  // Inner layer - higher weights for cluster core
  for (let i = 0; i < Math.floor(count * 0.4); i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (radius * 0.5); // 50% of radius for inner points
    const lat = centerLat + Math.sin(angle) * distance;
    const lng = centerLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Higher weights closer to the center with less falloff
    const normalizedDist = distance / (radius * 0.5); // 0 at center, 1 at mid radius
    const weight = maxWeight - (normalizedDist * (maxWeight - minWeight) * 0.6); // Slower falloff
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
  
  // Outer layer - creates gradual transition
  for (let i = 0; i < Math.floor(count * 0.6); i++) {
    const angle = Math.random() * Math.PI * 2;
    // Start from half radius out to full for broader spread
    const distance = (radius * 0.5) + (Math.random() * (radius * 0.5));
    const lat = centerLat + Math.sin(angle) * distance;
    const lng = centerLng + Math.cos(angle) * distance;
    
    // Skip this point if not on land (when check is provided)
    if (isOnLandCheck && !isOnLandCheck(lat, lng)) {
      continue;
    }
    
    // Weight falls off faster in outer zone
    const normalizedDist = (distance - (radius * 0.5)) / (radius * 0.5); // 0 at mid radius, 1 at max radius
    const weight = minWeight + ((1 - normalizedDist) * (maxWeight - minWeight) * 0.4); // Lower weights
    
    points.push({
      latitude: lat,
      longitude: lng,
      weight,
    });
  }
}

// Add a single point (landmark or major venue)
function addSinglePoint(points, lat, lng, weight) {
  points.push({
    latitude: lat,
    longitude: lng,
    weight,
  });
}

// For other cities, use a generic pattern but avoid water when coordinates suggest it
function generateGenericCityData(points, latitude, longitude, businessType) {
  // Make results consistent with seeded random
  const seed = latitude * 1000 + longitude + (businessType === 'retail' ? 1 : 
                                             businessType === 'restaurant' ? 2 :
                                             businessType === 'professional' ? 3 : 4);
  
  // Simple seeded random function
  const seededRandom = () => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };
  
  // Land check to avoid water
  const isLikelyOnLand = (lat, lng) => {
    const dist = Math.sqrt(Math.pow(lat - latitude, 2) + Math.pow(lng - longitude, 2));
    if (dist > 0.04) { // Increased radius
      return false;
    }
    return true;
  };
  
  // Check if this is a known major city
  const isLA = Math.abs(latitude - 34.0522) < 0.1 && Math.abs(longitude - (-118.2437)) < 0.1;
  const isNYC = Math.abs(latitude - 40.7128) < 0.1 && Math.abs(longitude - (-74.0060)) < 0.1;
  
  // Determine if this is likely a small city based on coordinates
  // We'll use a simple heuristic: look at the precision of coordinates
  // Major cities usually have more precise coordinates in databases
  const coordStr = `${latitude},${longitude}`;
  const isSmallCity = !isLA && !isNYC && (
    // If coordinates are very round numbers, it's likely a small city
    coordStr.includes('.0') || 
    coordStr.includes('.5') ||
    // Or check for low precision (fewer decimal places)
    (coordStr.split('.')[1]?.length < 4)
  );
  
  // Scale factors for small cities (concentrate activity more)
  const scaleFactor = isSmallCity ? 0.5 : 1.0; // Half the spread for small cities
  const countMultiplier = isSmallCity ? 0.7 : 1.0; // Fewer points for small cities
  const clusterRadius = isSmallCity ? 0.008 : 0.015; // Tighter clusters for small cities
  
  if (isLA) {
    generateLosAngelesData(points, businessType, seededRandom);
  } else if (isNYC) {
    generateNewYorkData(points, businessType, seededRandom);
  } else {
    // Generate generic city data with awareness of city size
    switch(businessType) {
      case 'retail':
        // For small cities: concentrate retail in center and along 1-2 main roads
        if (isSmallCity) {
          // Central business district/downtown
          generatePointsInArea(points, latitude, longitude, clusterRadius, 
            Math.floor(25 * countMultiplier), 60, 95, isLikelyOnLand);
          
          // Main street / commercial road
          const mainStreetAngle = seededRandom() * Math.PI;
          const mainStreetLength = 0.01 * scaleFactor;
          
          generatePointsAlongRoad(points,
            latitude - Math.sin(mainStreetAngle) * mainStreetLength,
            longitude - Math.cos(mainStreetAngle) * mainStreetLength,
            latitude + Math.sin(mainStreetAngle) * mainStreetLength,
            longitude + Math.cos(mainStreetAngle) * mainStreetLength,
            Math.floor(15 * countMultiplier), 55, 90, isLikelyOnLand
          );
          
          // Secondary retail area (like a mall or shopping center)
          const secondaryAngle = mainStreetAngle + (Math.PI / 2) + (seededRandom() * 0.5);
          const secondaryDist = 0.008 * scaleFactor;
          generatePointsInArea(points, 
            latitude + Math.sin(secondaryAngle) * secondaryDist,
            longitude + Math.cos(secondaryAngle) * secondaryDist,
            clusterRadius * 0.7, 
            Math.floor(15 * countMultiplier), 50, 80, isLikelyOnLand
          );
        } else {
          // Larger city pattern
          // Main downtown cluster - primary
          generatePointsInArea(points, latitude, longitude, 0.015, 35, 55, 95, isLikelyOnLand);
          
          // 2-3 secondary shopping areas
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const distance = 0.025 + (seededRandom() * 0.015);
            const clusterLat = latitude + Math.sin(angle) * distance;
            const clusterLng = longitude + Math.cos(angle) * distance;
            generatePointsInArea(points, clusterLat, clusterLng, 0.01, 25, 45, 85, isLikelyOnLand);
          }
        }
        break;
        
      case 'restaurant':
        if (isSmallCity) {
          // Main restaurant cluster near downtown
          generatePointsInArea(points, latitude, longitude, clusterRadius * 0.8, 
            Math.floor(20 * countMultiplier), 60, 95, isLikelyOnLand);
          
          // Small clusters/strips along 1-2 roads
          for (let i = 0; i < 2; i++) {
            const angle = (i / 2) * Math.PI + (seededRandom() * 0.3);
            const roadLength = 0.008 * scaleFactor;
            
            generatePointsAlongRoad(points,
              latitude,
              longitude,
              latitude + Math.sin(angle) * roadLength,
              longitude + Math.cos(angle) * roadLength,
              Math.floor(10 * countMultiplier), 50, 85, isLikelyOnLand
            );
          }
        } else {
          // Restaurant districts (2-3 major areas)
          generatePointsInArea(points, latitude + 0.005, longitude - 0.005, 0.012, 30, 50, 95, isLikelyOnLand);
          
          // Secondary dining areas
          for (let i = 0; i < 2; i++) {
            const angle = (i / 2) * Math.PI + (seededRandom() * 0.5);
            const distance = 0.02 + (seededRandom() * 0.01);
            const clusterLat = latitude + Math.sin(angle) * distance;
            const clusterLng = longitude + Math.cos(angle) * distance;
            generatePointsInArea(points, clusterLat, clusterLng, 0.008, 20, 45, 80, isLikelyOnLand);
          }
        }
        break;
        
      case 'professional':
        if (isSmallCity) {
          // Small town central business district - concentrated
          generatePointsInArea(points, latitude, longitude, clusterRadius * 0.6, 
            Math.floor(20 * countMultiplier), 60, 95, isLikelyOnLand);
          
          // Government/civic area nearby
          const govAngle = seededRandom() * Math.PI;
          const govDist = 0.005 * scaleFactor;
          generatePointsInArea(points,
            latitude + Math.sin(govAngle) * govDist,
            longitude + Math.cos(govAngle) * govDist,
            clusterRadius * 0.5, 
            Math.floor(10 * countMultiplier), 55, 85, isLikelyOnLand
          );
          
          // Medical area (small hospital/clinic area)
          const medAngle = govAngle + Math.PI/2;
          const medDist = 0.006 * scaleFactor;
          generatePointsInArea(points,
            latitude + Math.sin(medAngle) * medDist,
            longitude + Math.cos(medAngle) * medDist,
            clusterRadius * 0.4, 
            Math.floor(8 * countMultiplier), 50, 80, isLikelyOnLand
          );
        } else {
          // Downtown business district - main cluster
          generatePointsInArea(points, latitude, longitude, 0.012, 35, 55, 95, isLikelyOnLand);
          
          // Secondary business areas
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const distance = 0.025 + (seededRandom() * 0.01);
            const clusterLat = latitude + Math.sin(angle) * distance;
            const clusterLng = longitude + Math.cos(angle) * distance;
            generatePointsInArea(points, clusterLat, clusterLng, 0.008, 20, 40, 75, isLikelyOnLand);
          }
        }
        break;
        
      case 'entertainment':
        if (isSmallCity) {
          // Small town entertainment - very concentrated
          generatePointsInArea(points, latitude, longitude, clusterRadius * 0.7, 
            Math.floor(15 * countMultiplier), 65, 95, isLikelyOnLand);
          
          // One secondary area (like a theater or recreation area)
          const recAngle = seededRandom() * Math.PI;
          const recDist = 0.007 * scaleFactor;
          generatePointsInArea(points,
            latitude + Math.sin(recAngle) * recDist,
            longitude + Math.cos(recAngle) * recDist,
            clusterRadius * 0.5, 
            Math.floor(10 * countMultiplier), 55, 85, isLikelyOnLand
          );
        } else {
          // Main entertainment district
          generatePointsInArea(points, latitude - 0.002, longitude + 0.003, 0.01, 30, 60, 95, isLikelyOnLand);
          
          // Scattered entertainment zones
          for (let i = 0; i < 2; i++) {
            const angle = (i / 2) * Math.PI + 0.5;
            const distance = 0.018 + (seededRandom() * 0.015);
            const clusterLat = latitude + Math.sin(angle) * distance;
            const clusterLng = longitude + Math.cos(angle) * distance;
            generatePointsInArea(points, clusterLat, clusterLng, 0.008, 20, 45, 85, isLikelyOnLand);
          }
        }
        break;
        
      default:
        // Default pattern - one concentrated cluster for small cities
        if (isSmallCity) {
          generatePointsInArea(points, latitude, longitude, clusterRadius, 
            Math.floor(25 * countMultiplier), 55, 90, isLikelyOnLand);
        } else {
          // Default pattern - one large cluster
          generatePointsInArea(points, latitude, longitude, 0.015, 40, 50, 90, isLikelyOnLand);
        }
    }
  }
}

// Generate Muscat-specific data based on the actual layout of the city
function generateMuscatData(points, businessType) {
  // Key areas in Muscat
  const cityCenter = { latitude: 23.5880, longitude: 58.3829 };
  const muttrah = { latitude: 23.6245, longitude: 58.5645 };
  const qurm = { latitude: 23.6102, longitude: 58.4459 };
  const alKhuwair = { latitude: 23.5902, longitude: 58.4088 };
  const ruwi = { latitude: 23.5841, longitude: 58.5456 };
  const seeb = { latitude: 23.6703, longitude: 58.1891 };
  const muscat = { latitude: 23.6086, longitude: 58.5922 };
  
  // Check if point is on land (rough approximation)
  const isOnLand = (lat, lng) => {
    // Simplified check: avoid Gulf of Oman
    if (lng > 58.40 && lat < 23.62) {
      return false;
    }
    return true;
  };
  
  // Define retail hotspots for Muscat - fewer locations but larger clusters
  if (businessType === 'retail') {
    // Muscat Grand Mall area - major hotspot
    generatePointsInArea(points, 23.5924, 58.4093, 0.006, 25, 60, 95, isOnLand);
    
    // Avenues Mall area - medium hotspot
    generatePointsInArea(points, 23.5883, 58.3896, 0.005, 20, 55, 85, isOnLand);
    
    // Al Mouj Muscat (The Wave) - significant cluster
    generatePointsInArea(points, 23.6317, 58.2685, 0.008, 25, 50, 85, isOnLand);
    
    // Qurm Commercial Area - broad corridor
    generatePointsAlongRoad(points,
      qurm.latitude, qurm.longitude,
      qurm.latitude + 0.01, qurm.longitude + 0.005,
      15, 55, 90,
      isOnLand);
    
    // Ruwi Commercial District - smaller but dense
    generatePointsInArea(points, ruwi.latitude, ruwi.longitude, 0.006, 20, 45, 80, isOnLand);
  }
  
  // Define restaurant hotspots for Muscat
  else if (businessType === 'restaurant') {
    // Al Mouj Waterfront restaurants - major cluster
    generatePointsInArea(points, 23.6320, 58.2680, 0.008, 30, 55, 95, isOnLand);
    
    // Qurm restaurants - significant area
    generatePointsInArea(points, qurm.latitude, qurm.longitude, 0.007, 25, 50, 90, isOnLand);
    
    // Shatti Al Qurum beachfront - linear cluster
    generatePointsAlongRoad(points,
      23.6138, 58.4721,
      23.6056, 58.4524,
      12, 55, 85,
      isOnLand);
    
    // Al Khuwair restaurant district - dense area
    generatePointsInArea(points, alKhuwair.latitude, alKhuwair.longitude, 0.006, 22, 50, 85, isOnLand);
  }
  
  // Define professional services areas for Muscat
  else if (businessType === 'professional') {
    // Central Business District (CBD) - primary concentration  
    generatePointsInArea(points, 23.5938, 58.4539, 0.008, 35, 55, 95, isOnLand);
    
    // Al Khuwair business district - secondary hub
    generatePointsInArea(points, alKhuwair.latitude, alKhuwair.longitude, 0.007, 25, 50, 85, isOnLand);
    
    // Ruwi business center - smaller hub
    generatePointsInArea(points, ruwi.latitude, ruwi.longitude, 0.006, 20, 45, 80, isOnLand);
  }
  
  // Define entertainment venues for Muscat
  else if (businessType === 'entertainment') {
    // Al Mouj Marina area - major entertainment zone
    generatePointsInArea(points, 23.6333, 58.2667, 0.009, 30, 55, 95, isOnLand);
    
    // Qurum area (parks, malls, etc) - significant hub
    generatePointsInArea(points, 23.6102, 58.4459, 0.008, 25, 50, 90, isOnLand);
    
    // Muttrah Corniche - tourist corridor
    generatePointsAlongRoad(points,
      muttrah.latitude, muttrah.longitude,
      muttrah.latitude - 0.005, muttrah.longitude - 0.01,
      12, 55, 85,
      isOnLand);
    
    // City center entertainment - smaller hub
    generatePointsInArea(points, cityCenter.latitude, cityCenter.longitude, 0.006, 20, 45, 80, isOnLand);
  }
  
  // Generic retail as a fallback - one large cluster
  else {
    generatePointsInArea(points, cityCenter.latitude, cityCenter.longitude, 0.01, 40, 50, 90, isOnLand);
  }
}

// Add Los Angeles specific data with large clusters
function generateLosAngelesData(points, businessType, seededRandom = Math.random) {
  // Main areas of LA
  const downtown = { latitude: 34.0522, longitude: -118.2437 };
  const hollywood = { latitude: 34.0928, longitude: -118.3287 };
  const santaMonica = { latitude: 34.0195, longitude: -118.4912 };
  const beverlyHills = { latitude: 34.0736, longitude: -118.4004 };
  const lax = { latitude: 33.9416, longitude: -118.4085 };
  const longBeach = { latitude: 33.7701, longitude: -118.1937 };
  const pasadena = { latitude: 34.1478, longitude: -118.1445 };
  const anaheim = { latitude: 33.8366, longitude: -117.9143 };
  
  // Define retail hotspots for LA
  if (businessType === 'retail') {
    // Downtown LA - major shopping
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.02, 40, 60, 95);
    
    // Beverly Hills - luxury shopping
    generatePointsInArea(points, beverlyHills.latitude, beverlyHills.longitude, 0.015, 35, 55, 90);
    
    // Santa Monica - beach/promenade shopping
    generatePointsInArea(points, santaMonica.latitude, santaMonica.longitude, 0.018, 30, 50, 85);
    
    // Anaheim/Orange County shopping
    generatePointsInArea(points, anaheim.latitude, anaheim.longitude, 0.02, 35, 55, 90);
  } 
  
  // Define restaurant hotspots for LA
  else if (businessType === 'restaurant') {
    // Hollywood restaurant scene
    generatePointsInArea(points, hollywood.latitude, hollywood.longitude, 0.018, 35, 55, 90);
    
    // Downtown dining
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.015, 30, 50, 85);
    
    // Koreatown
    generatePointsInArea(points, 34.0611, -118.3080, 0.015, 35, 60, 95);
    
    // Beach areas
    generatePointsInArea(points, santaMonica.latitude, santaMonica.longitude, 0.018, 30, 50, 85);
  }
  
  // Define professional services for LA
  else if (businessType === 'professional') {
    // Downtown financial district
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.018, 40, 60, 95);
    
    // Century City
    generatePointsInArea(points, 34.0522, -118.4155, 0.015, 35, 55, 90);
    
    // Pasadena
    generatePointsInArea(points, pasadena.latitude, pasadena.longitude, 0.015, 25, 45, 75);
  }
  
  // Define entertainment venues for LA
  else if (businessType === 'entertainment') {
    // Hollywood/Universal
    generatePointsInArea(points, hollywood.latitude, hollywood.longitude, 0.02, 40, 60, 95);
    
    // Downtown entertainment
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.015, 30, 50, 85);
    
    // Santa Monica/Venice beach
    generatePointsInArea(points, santaMonica.latitude, santaMonica.longitude, 0.02, 35, 55, 90);
    
    // Anaheim/Disney
    generatePointsInArea(points, anaheim.latitude, anaheim.longitude, 0.02, 40, 60, 95);
  }
  
  // Generic as fallback
  else {
    generatePointsInArea(points, downtown.latitude, downtown.longitude, 0.025, 45, 55, 90);
  }
}

// Add New York City specific data with Manhattan focus
function generateNewYorkData(points, businessType, seededRandom = Math.random) {
  // Key areas in NYC
  const manhattan = { latitude: 40.7831, longitude: -73.9712 };
  const midtown = { latitude: 40.7549, longitude: -73.9840 };
  const financialDistrict = { latitude: 40.7075, longitude: -74.0113 };
  const brooklyn = { latitude: 40.6782, longitude: -73.9442 };
  const queens = { latitude: 40.7282, longitude: -73.7949 };
  
  // Check Manhattan island (simplified)
  const isOnManhattan = (lat, lng) => {
    // Rough bounds of Manhattan
    return lat > 40.70 && lat < 40.82 && lng > -74.02 && lng < -73.92;
  };
  
  // Define retail hotspots for NYC
  if (businessType === 'retail') {
    // Fifth Avenue/Midtown shopping
    generatePointsInArea(points, midtown.latitude, midtown.longitude, 0.015, 40, 65, 95);
    
    // SoHo shopping district
    generatePointsInArea(points, 40.7248, -74.0018, 0.01, 30, 60, 90);
    
    // Herald Square/Macy's area
    generatePointsInArea(points, 40.7505, -73.9877, 0.008, 25, 60, 90);
    
    // Downtown Brooklyn shopping
    generatePointsInArea(points, 40.6903, -73.9839, 0.012, 30, 50, 80);
  } 
  
  // Define restaurant hotspots for NYC
  else if (businessType === 'restaurant') {
    // Restaurant row/Hell's Kitchen
    generatePointsInArea(points, 40.7630, -73.9873, 0.01, 35, 60, 95);
    
    // Lower East Side dining
    generatePointsInArea(points, 40.7180, -73.9855, 0.012, 35, 55, 90);
    
    // Williamsburg restaurants
    generatePointsInArea(points, 40.7135, -73.9566, 0.015, 30, 50, 85);
    
    // Greenwich Village dining
    generatePointsInArea(points, 40.7347, -74.0049, 0.01, 30, 55, 90);
  }
  
  // Define professional services for NYC
  else if (businessType === 'professional') {
    // Financial District
    generatePointsInArea(points, financialDistrict.latitude, financialDistrict.longitude, 0.01, 40, 70, 95);
    
    // Midtown office district
    generatePointsInArea(points, midtown.latitude, midtown.longitude, 0.015, 45, 65, 95);
    
    // Downtown Brooklyn offices
    generatePointsInArea(points, 40.6940, -73.9867, 0.01, 30, 50, 80);
    
    // Long Island City
    generatePointsInArea(points, 40.7483, -73.9487, 0.012, 30, 50, 80);
  }
  
  // Define entertainment venues for NYC
  else if (businessType === 'entertainment') {
    // Times Square/Theater District
    generatePointsInArea(points, 40.7580, -73.9855, 0.01, 40, 70, 95);
    
    // Madison Square Garden area
    generatePointsInArea(points, 40.7505, -73.9934, 0.008, 35, 65, 90);
    
    // Lower Manhattan entertainment
    generatePointsInArea(points, 40.7264, -74.0055, 0.012, 35, 55, 85);
    
    // Barclays Center/Brooklyn
    generatePointsInArea(points, 40.6828, -73.9753, 0.01, 30, 55, 85);
  }
  
  // Generic as fallback - Manhattan focus
  else {
    // Mostly concentrate in Manhattan with higher density
    generatePointsInArea(points, manhattan.latitude, manhattan.longitude, 0.03, 50, 60, 95);
  }
}

const LocationAnalysisScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Get idea from route params if available
  const idea = route.params?.idea;
  
  // Check if the business idea is online/digital
  const isOnlineBusiness = React.useMemo(() => {
    if (!idea) return false;
    
    // Check if idea title or description contains online-related keywords
    const onlineKeywords = ['online', 'digital', 'web', 'internet', 'app', 'mobile', 'website', 'e-commerce', 'virtual', 'remote'];
    const ideaText = `${idea.title || ''} ${idea.description || ''} ${idea.category || ''}`.toLowerCase();
    
    return onlineKeywords.some(keyword => ideaText.includes(keyword));
  }, [idea]);
  
  // State variables
  const [locationInput, setLocationInput] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState(
    // Match business type from idea category if available, default to retail if no match
    idea?.category ? 
      BUSINESS_TYPES.find(type => 
        idea.category.toLowerCase().includes(type.id)
      )?.id || 'retail' 
      : 'retail'
  );
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [bestLocation, setBestLocation] = useState(null);
  const [isWebPlatform] = useState(Platform.OS === 'web');
  const [mapRegion, setMapRegion] = useState(null);
  const [analysisKey, setAnalysisKey] = useState('');
  
  // In useEffect, show an alert if no idea is provided
  useEffect(() => {
    if (!idea) {
      Alert.alert(
        'No Business Idea Selected',
        'This analysis requires a business idea to be selected first.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [idea, navigation]);
  
  // Update navigation header based on business type
  useEffect(() => {
    navigation.setOptions({
      title: isOnlineBusiness ? 'Online Market Analysis' : 'Location Analysis',
    });
  }, [navigation, isOnlineBusiness]);
  
  // Only request location permissions for physical businesses
  useEffect(() => {
    if (!isOnlineBusiness) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      })();
    }
  }, [isOnlineBusiness]);
  
  // Update map region when selectedLocation changes (for physical businesses)
  useEffect(() => {
    if (selectedLocation && !isOnlineBusiness) {
      setMapRegion({
        ...selectedLocation,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    }
  }, [selectedLocation, isOnlineBusiness]);
  
  // Handle city input changes and fetch suggestions with debounce
  const handleLocationInputChange = async (text) => {
    setLocationInput(text);
    
    // Only search if there's enough text to avoid excessive API calls
    if (text.length >= 2) {
      // Clear any previous timeout to implement debounce
      if (window.locationSearchTimeout) {
        clearTimeout(window.locationSearchTimeout);
      }
      
      // Set a timeout to delay the API call (debounce)
      window.locationSearchTimeout = setTimeout(async () => {
        try {
          setLoading(true);
          const suggestions = await LocationDataService.getCitySuggestions(text);
          setCitySuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching city suggestions:', error);
          // Show a user-friendly error message
          Alert.alert('Search Error', 'Unable to find cities. Please try again.');
        } finally {
          setLoading(false);
        }
      }, 500); // 500ms delay for debounce
    } else {
      setCitySuggestions([]);
    }
  };
  
  // Handle selecting a city from suggestions
  const handleSelectLocation = (location) => {
    setLocationInput(location.name);
    setSelectedLocation(location.coords);
    setCitySuggestions([]);
    // Clear previous analysis results
    setHeatmapData(null);
    setBestLocation(null);
  };
  
  // Analyze the selected location
  const analyzeLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Please select a location', 'Enter and select a city to analyze.');
      return;
    }
    
    // Create a unique key for this analysis to ensure consistent results
    const newAnalysisKey = `${selectedLocation.latitude}_${selectedLocation.longitude}_${selectedBusinessType}`;
    
    // If we already analyzed this exact combination, don't repeat the analysis
    if (newAnalysisKey === analysisKey && heatmapData) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await LocationDataService.getHeatmapDataForLocation(
        selectedLocation, 
        selectedBusinessType
      );
      setHeatmapData(data.points);
      setBestLocation(data.bestLocation);
      setAnalysisKey(newAnalysisKey);
    } catch (error) {
      console.error('Error analyzing location:', error);
      Alert.alert('Error', 'Failed to analyze location. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render the map with heatmap (for physical businesses)
  const renderMap = () => {
    if (isWebPlatform) {
      // Web-friendly placeholder instead of maps
      return (
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.card }]}>
          {selectedLocation ? (
            <View style={styles.webMapView}>
              <Ionicons name="location" size={48} color={colors.primary} style={styles.webMapIcon} />
              <Text style={[styles.mapPlaceholderText, { color: colors.text }]}>
                Location selected: {locationInput}
              </Text>
              {bestLocation && (
                <View style={styles.webMapBestLocation}>
                  <Ionicons name="star" size={30} color="gold" style={styles.webMapIcon} />
                  <Text style={[styles.webMapBestLocationText, { color: colors.text }]}>
                    Optimal location identified
                  </Text>
                  <Text style={[styles.bestLocationDetails, { color: colors.text }]}>
                    Coordinates: {bestLocation.latitude.toFixed(4)}, {bestLocation.longitude.toFixed(4)}
                  </Text>
                  <Text style={[styles.bestLocationDetails, { color: colors.text }]}>
                    Score: {bestLocation.weight.toFixed(1)}
                  </Text>
                </View>
              )}
              <Text style={[styles.webMapNote, { color: colors.text + '80' }]}>
                Interactive map available on mobile devices
              </Text>
            </View>
          ) : (
            <>
              <Ionicons name="location" size={48} color={colors.primary} />
              <Text style={[styles.mapPlaceholderText, { color: colors.text }]}>
                Enter a location to generate analysis
              </Text>
            </>
          )}
        </View>
      );
    }

    // First check if location is selected
    if (!selectedLocation) {
      return (
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.card }]}>
          <Ionicons name="location" size={48} color={colors.primary} />
          <Text style={[styles.mapPlaceholderText, { color: colors.text }]}>
            Enter a location to generate analysis
          </Text>
        </View>
      );
    }

    const isIOS = Platform.OS === 'ios';
    const mapProvider = isIOS ? null : PROVIDER_GOOGLE; // Use Apple Maps on iOS, Google Maps on Android
    
    try {
      return (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={mapProvider}
            initialRegion={mapRegion || {
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            zoomEnabled={true}
            zoomTapEnabled={true}
            minZoomLevel={11}
            maxZoomLevel={14}
          >
            {/* Show heatmap data if available - Android only for now */}
            {!isIOS && heatmapData && (
              <Heatmap
                points={heatmapData}
                radius={50}
                opacity={0.8}
                gradient={{
                  colors: ['rgba(0, 0, 255, 0.5)', 'rgba(0, 255, 0, 0.7)', 'rgba(255, 255, 0, 0.8)', 'rgba(255, 0, 0, 0.9)'],
                  startPoints: [0, 0.25, 0.5, 0.75],
                  colorMapSize: 256,
                }}
                maxIntensity={75}
                gradientSmoothing={20}
                heatmapMode="POINTS_WEIGHT"
              />
            )}
            
            {/* For iOS, create a visual representation of hotspots */}
            {isIOS && heatmapData && heatmapData.map((point, index) => {
              // Only show the highest-weighted points to avoid overwhelming the map
              if (point.weight < 60) return null;
              
              // Calculate size and opacity based on weight
              const size = Math.min(point.weight * 0.8, 80); 
              const opacity = Math.min(point.weight / 100, 0.7);
              
              // Use colors similar to heatmap
              let color;
              if (point.weight > 80) color = 'rgba(255, 0, 0, ' + opacity + ')';
              else if (point.weight > 70) color = 'rgba(255, 128, 0, ' + opacity + ')';
              else color = 'rgba(255, 255, 0, ' + opacity + ')';
              
              return (
                <Marker
                  key={`hotspot-${index}`}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  anchor={{x: 0.5, y: 0.5}}
                  opacity={0.8}
                >
                  <View
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size/2,
                      backgroundColor: color,
                    }}
                  />
                </Marker>
              );
            })}
            
            {/* Mark the best location if available */}
            {bestLocation && (
              <Marker
                coordinate={{
                  latitude: bestLocation.latitude,
                  longitude: bestLocation.longitude,
                }}
                title="Optimal Location"
                description={`This location has the highest opportunity score: ${bestLocation.weight.toFixed(1)}`}
                pinColor={isIOS ? "gold" : undefined}
              >
                {!isIOS && (
                  <Ionicons name="star" size={30} color="gold" />
                )}
              </Marker>
            )}
          </MapView>
        </View>
      );
    } catch (error) {
      console.warn('Error rendering map:', error);
      // Fallback to a simple view if map rendering fails
      return (
        <View style={[styles.mapPlaceholder, { backgroundColor: colors.card }]}>
          <View style={styles.webMapView}>
            <Ionicons name="location" size={48} color={colors.primary} style={styles.webMapIcon} />
            <Text style={[styles.mapPlaceholderText, { color: colors.text }]}>
              Location selected: {locationInput}
            </Text>
            {bestLocation && (
              <View style={styles.webMapBestLocation}>
                <Ionicons name="star" size={30} color="gold" style={styles.webMapIcon} />
                <Text style={[styles.webMapBestLocationText, { color: colors.text }]}>
                  Optimal location identified
                </Text>
                <Text style={[styles.bestLocationDetails, { color: colors.text }]}>
                  Coordinates: {bestLocation.latitude.toFixed(4)}, {bestLocation.longitude.toFixed(4)}
                </Text>
                <Text style={[styles.bestLocationDetails, { color: colors.text }]}>
                  Score: {bestLocation.weight.toFixed(1)}
                </Text>
              </View>
            )}
            <Text style={[styles.webMapNote, { color: colors.text + '80' }]}>
              Unable to load interactive map. Please try again later.
            </Text>
          </View>
        </View>
      );
    }
  };
  
  // Render online business content
  const renderOnlineBusinessContent = () => {
    return (
      <View style={styles.content}>
        <View style={[styles.onlineBusinessContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.onlineBusinessHeader}>
            <Ionicons name="globe-outline" size={48} color={colors.primary} style={styles.onlineBusinessIcon} />
            <Text style={[styles.onlineBusinessTitle, { color: colors.text }]}>
              {idea?.title || 'Online Business'}
            </Text>
          </View>
          
          <Text style={[styles.onlineBusinessDescription, { color: colors.text }]}>
            Your business idea appears to be an online venture. Online businesses can operate globally and aren't typically tied to specific physical locations.
          </Text>
          
          <View style={styles.onlineBusinessSection}>
            <Text style={[styles.onlineBusinessSectionTitle, { color: colors.primary }]}>
              Key Considerations for Online Businesses:
            </Text>
            
            <View style={styles.onlineBusinessPoint}>
              <Ionicons name="people" size={22} color={colors.primary} style={styles.onlineBusinessPointIcon} />
              <View style={styles.onlineBusinessPointContent}>
                <Text style={[styles.onlineBusinessPointTitle, { color: colors.text }]}>Target Market</Text>
                <Text style={[styles.onlineBusinessPointText, { color: colors.text }]}>
                  Consider the demographics and preferences of your target audience across different regions.
                </Text>
              </View>
            </View>
            
            <View style={styles.onlineBusinessPoint}>
              <Ionicons name="globe" size={22} color={colors.primary} style={styles.onlineBusinessPointIcon} />
              <View style={styles.onlineBusinessPointContent}>
                <Text style={[styles.onlineBusinessPointTitle, { color: colors.text }]}>Global Reach</Text>
                <Text style={[styles.onlineBusinessPointText, { color: colors.text }]}>
                  Identify key regions for marketing focus, considering cultural differences and language barriers.
                </Text>
              </View>
            </View>
            
            <View style={styles.onlineBusinessPoint}>
              <Ionicons name="business" size={22} color={colors.primary} style={styles.onlineBusinessPointIcon} />
              <View style={styles.onlineBusinessPointContent}>
                <Text style={[styles.onlineBusinessPointTitle, { color: colors.text }]}>Business Registration</Text>
                <Text style={[styles.onlineBusinessPointText, { color: colors.text }]}>
                  Research the best location to register your business based on tax implications and legal requirements.
                </Text>
              </View>
            </View>
            
            <View style={styles.onlineBusinessPoint}>
              <Ionicons name="server" size={22} color={colors.primary} style={styles.onlineBusinessPointIcon} />
              <View style={styles.onlineBusinessPointContent}>
                <Text style={[styles.onlineBusinessPointTitle, { color: colors.text }]}>Infrastructure</Text>
                <Text style={[styles.onlineBusinessPointText, { color: colors.text }]}>
                  Consider server locations, content delivery networks, and latency for your target markets.
                </Text>
              </View>
            </View>
            
            {idea?.category?.toLowerCase().includes('commerce') && (
              <View style={styles.onlineBusinessPoint}>
                <Ionicons name="cube" size={22} color={colors.primary} style={styles.onlineBusinessPointIcon} />
                <View style={styles.onlineBusinessPointContent}>
                  <Text style={[styles.onlineBusinessPointTitle, { color: colors.text }]}>Fulfillment</Text>
                  <Text style={[styles.onlineBusinessPointText, { color: colors.text }]}>
                    For e-commerce, consider warehouse and fulfillment center locations to optimize shipping times and costs.
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.onlineBusinessPoint}>
              <Ionicons name="shield-checkmark" size={22} color={colors.primary} style={styles.onlineBusinessPointIcon} />
              <View style={styles.onlineBusinessPointContent}>
                <Text style={[styles.onlineBusinessPointTitle, { color: colors.text }]}>Regulations</Text>
                <Text style={[styles.onlineBusinessPointText, { color: colors.text }]}>
                  Be aware of varying digital regulations like GDPR in Europe, CCPA in California, or region-specific requirements.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: colors.primary, marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="white" style={styles.analyzeButtonIcon} />
          <Text style={styles.analyzeButtonText}>Back to Idea Details</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render based on business type
  if (isOnlineBusiness) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderOnlineBusinessContent()}
      </ScrollView>
    );
  }
  
  // Original render for physical businesses
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Location Input Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Enter a Location
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card, 
              color: colors.text,
              borderColor: colors.border
            }]}
            placeholder="City or area name..."
            placeholderTextColor={colors.text + '80'}
            value={locationInput}
            onChangeText={handleLocationInputChange}
          />
          {/* Suggestions dropdown */}
          {citySuggestions.length > 0 && (
            <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {citySuggestions.map((city, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionItem,
                    index < citySuggestions.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                  ]}
                  onPress={() => handleSelectLocation(city)}
                >
                  <Ionicons name="location-outline" size={18} color={colors.primary} style={styles.suggestionIcon} />
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{city.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Business Type Info Section - Replacing the selection UI */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Business Type
          </Text>
          <View style={[styles.businessTypeContainer, { paddingVertical: 8 }]}>
            <Text style={[styles.businessTypeText, { color: colors.text }]}>
              Analyzing for: {BUSINESS_TYPES.find(t => t.id === selectedBusinessType)?.label || 'General Business'}
              {idea?.title ? ` (${idea.title})` : ''}
            </Text>
          </View>
        </View>
        
        {/* Analyze Button */}
        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: colors.primary }]}
          onPress={analyzeLocation}
          disabled={loading || !selectedLocation}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="analytics" size={20} color="white" style={styles.analyzeButtonIcon} />
              <Text style={styles.analyzeButtonText}>Analyze Location</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Map Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isWebPlatform ? 'Location Analysis' : Platform.OS === 'ios' ? 'Location Map' : 'Opportunity Heatmap'}
          </Text>
          {renderMap()}
          
          {/* Legend - only show on Android for heatmap */}
          {heatmapData && Platform.OS === 'android' && (
            <View style={styles.legend}>
              <Text style={[styles.legendTitle, { color: colors.text }]}>
                Opportunity Score
              </Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: 'blue' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Low</Text>
                <View style={[styles.legendColor, { backgroundColor: 'green' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Medium</Text>
                <View style={[styles.legendColor, { backgroundColor: 'yellow' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>High</Text>
                <View style={[styles.legendColor, { backgroundColor: 'red' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Optimal</Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Analysis Results */}
        {bestLocation && (
          <View style={[styles.resultsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              Analysis Results
            </Text>
            <Text style={[styles.resultsText, { color: colors.text }]}>
              We've analyzed {selectedLocation ? locationInput : 'the selected area'} for your business idea{
                idea?.title ? ` "${idea.title}"` : ''
              } as a {
                BUSINESS_TYPES.find(t => t.id === selectedBusinessType)?.label || 'business'
              }.
            </Text>
            <Text style={[styles.resultsText, { color: colors.text, marginTop: 8 }]}>
              {isWebPlatform ? 
                `Based on our analysis, we've identified an optimal location at coordinates (${bestLocation.latitude.toFixed(4)}, ${bestLocation.longitude.toFixed(4)}) with an opportunity score of ${bestLocation.weight.toFixed(1)}.` :
                "The optimal location is marked on the map with a star or gold pin. This area has the highest opportunity score based on factors like foot traffic, competitor density, and accessibility."
              }
            </Text>
            <View style={styles.resultsTipsContainer}>
              <Text style={[styles.resultsTipsTitle, { color: colors.primary }]}>
                Tips:
              </Text>
              <View style={styles.resultsTip}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.resultsTipIcon} />
                <Text style={[styles.resultsTipText, { color: colors.text }]}>
                  {Platform.OS === 'ios' ? 
                    "iOS uses Apple Maps which shows basic location pins" :
                    isWebPlatform ? 
                      "For detailed heatmap visualization, view this feature on a mobile device" :
                      "Red and yellow areas on the map indicate higher opportunity scores"
                  }
                </Text>
              </View>
              <View style={styles.resultsTip}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.resultsTipIcon} />
                <Text style={[styles.resultsTipText, { color: colors.text }]}>
                  {isWebPlatform ? 
                    "The analysis considers factors like foot traffic, competitor density, and accessibility" :
                    Platform.OS === 'ios' ?
                      "For heatmap visualization, view this feature on an Android device" :
                      "Explore the map to see different areas and their opportunity levels"
                  }
                </Text>
              </View>
              <View style={styles.resultsTip}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.resultsTipIcon} />
                <Text style={[styles.resultsTipText, { color: colors.text }]}>
                  Try analyzing different business types to compare results
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default LocationAnalysisScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 16,
  },
  businessTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  businessTypeButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  businessTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  analyzeButtonIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Online business styles
  onlineBusinessContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  onlineBusinessHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  onlineBusinessIcon: {
    marginBottom: 8,
  },
  onlineBusinessTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  onlineBusinessDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  onlineBusinessSection: {
    marginTop: 10,
  },
  onlineBusinessSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  onlineBusinessPoint: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  onlineBusinessPointIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  onlineBusinessPointContent: {
    flex: 1,
  },
  onlineBusinessPointTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  onlineBusinessPointText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Existing styles (unchanged)
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    height: 300,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
  },
  legend: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendText: {
    fontSize: 14,
    marginRight: 12,
    fontWeight: '500',
  },
  resultsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 16,
    lineHeight: 22,
  },
  resultsTipsContainer: {
    marginTop: 16,
  },
  resultsTipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  resultsTipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  resultsTipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  webMapView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMapIcon: {
    marginBottom: 12,
  },
  webMapBestLocation: {
    marginTop: 16,
    alignItems: 'center',
  },
  webMapBestLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  webMapNote: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
  },
  bestLocationDetails: {
    marginTop: 8,
    fontSize: 14,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
}); 