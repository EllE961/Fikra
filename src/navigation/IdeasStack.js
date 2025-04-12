// src/navigation/IdeasStack.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "@react-navigation/native";
import IdeasListScreen from "../screens/Ideas/IdeasListScreen";
import IdeaDetailScreen from "../screens/Ideas/IdeaDetailScreen";
import BusinessModelScreen from "../screens/Ideas/BusinessModelScreen";
import BusinessModelVisualization from "../screens/Ideas/BusinessModelVisualization";
import ChatAdvisorScreen from "../screens/Ideas/ChatAdvisorScreen";
import MarketingToolsScreen from "../screens/Ideas/MarketingToolsScreen";
import MarketAnalysisStack from './MarketAnalysisStack';

const Stack = createStackNavigator();

const IdeasStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="IdeasList"
        component={IdeasListScreen}
        options={{ title: "My Ideas" }}
      />
      <Stack.Screen
        name="IdeaDetail"
        component={IdeaDetailScreen}
        options={({ route }) => ({ title: route.params.idea.title || "Idea Details" })}
      />
      <Stack.Screen
        name="ChatAdvisor"
        component={ChatAdvisorScreen}
        options={{ title: "AI Business Advisor" }}
      />
      <Stack.Screen
        name="BusinessModel"
        component={BusinessModelScreen}
        options={{ title: "Business Model Canvas" }}
      />
      <Stack.Screen
        name="BusinessModelScreen"
        component={BusinessModelScreen}
        options={{ title: "Edit Business Model" }}
      />
      <Stack.Screen
        name="BusinessModelVisualization"
        component={BusinessModelVisualization}
        options={{ title: "Business Model Canvas" }}
      />
      <Stack.Screen
        name="MarketingTools"
        component={MarketingToolsScreen}
        options={{ title: "Marketing Tools" }}
      />
      <Stack.Screen
        name="MarketAnalysisStack"
        component={MarketAnalysisStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default IdeasStack;
