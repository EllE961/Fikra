import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MarketAnalysisScreen from '../screens/MarketAnalysis/MarketAnalysisScreen';
import SocialCompetitorScreen from '../screens/MarketAnalysis/SocialCompetitorScreen';
import MarketTrendsScreen from '../screens/MarketAnalysis/MarketTrendsScreen';
import CustomerAnalysisScreen from '../screens/MarketAnalysis/CustomerAnalysisScreen';

const Stack = createStackNavigator();

const MarketAnalysisNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="MarketAnalysisScreen"
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen 
        name="MarketAnalysisScreen" 
        component={MarketAnalysisScreen} 
        options={{ headerTitle: 'Market Analysis' }}
      />
      <Stack.Screen 
        name="SocialCompetitorScreen" 
        component={SocialCompetitorScreen} 
        options={{ headerTitle: 'Social Competitors' }}
      />
      <Stack.Screen 
        name="MarketTrendsScreen" 
        component={MarketTrendsScreen} 
        options={{ headerTitle: 'Market Trends' }}
      />
      <Stack.Screen 
        name="CustomerAnalysisScreen" 
        component={CustomerAnalysisScreen} 
        options={{ headerTitle: 'Customer Analysis' }}
      />
    </Stack.Navigator>
  );
};

export default MarketAnalysisNavigator; 