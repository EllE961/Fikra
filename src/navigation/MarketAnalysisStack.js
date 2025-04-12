import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';

import MarketAnalysisScreen from '../screens/MarketAnalysis/MarketAnalysisScreen';
import SocialCompetitorScreen from '../screens/MarketAnalysis/SocialCompetitorScreen';
import LocationAnalysisScreen from '../screens/MarketAnalysis/LocationAnalysisScreen';

const Stack = createStackNavigator();

const MarketAnalysisStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="MarketAnalysisMain" 
        component={MarketAnalysisScreen} 
      />
      <Stack.Screen 
        name="SocialCompetitor" 
        component={SocialCompetitorScreen} 
      />
      <Stack.Screen
        name="LocationAnalysis"
        component={LocationAnalysisScreen}
      />
    </Stack.Navigator>
  );
};

export default MarketAnalysisStack; 