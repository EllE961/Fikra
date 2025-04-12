// src/navigation/BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import IdeasStack from "./IdeasStack";
import ExploreScreen from "../screens/Explore/ExploreScreen";
import CreateIdeaScreen from "../screens/Ideas/CreateIdeaScreen";
import ExistingIdeaScreen from "../screens/Ideas/ExistingIdeaScreen";
import IdeaChoiceScreen from "../screens/Ideas/IdeaChoiceScreen";
import NotificationsScreen from "../screens/Dashboard/NotificationsScreen";
import ProfileNavigator from "./ProfileNavigator";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const Tab = createBottomTabNavigator();
const CreateStack = createStackNavigator();

// Create stack navigator for the Create tab
const CreateIdeaNavigator = () => {
  return (
    <CreateStack.Navigator>
      <CreateStack.Screen 
        name="IdeaChoice" 
        component={IdeaChoiceScreen}
        options={{ 
          headerTitle: "Create Business Idea",
          headerShown: true,
        }}
      />
      <CreateStack.Screen 
        name="CreateIdea" 
        component={CreateIdeaScreen}
        options={{ 
          headerTitle: "Generate Business Ideas",
          headerShown: true,
        }}
      />
      <CreateStack.Screen 
        name="ExistingIdea" 
        component={ExistingIdeaScreen}
        options={{ 
          headerTitle: "Describe Your Idea",
          headerShown: true,
        }}
      />
    </CreateStack.Navigator>
  );
};

const BottomTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "IdeasStack") {
            iconName = focused ? "list-circle" : "list-circle-outline";
          } else if (route.name === "Explore") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "CreateIdeaNavigator") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "ProfileNavigator") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="IdeasStack"
        component={IdeasStack}
        options={{ title: "Ideas" }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            // Reset to the root screen of the stack when pressing the tab
            const routeName = getFocusedRouteNameFromRoute(route);
            if (routeName && routeName !== 'IdeasList') {
              e.preventDefault();
              navigation.navigate('IdeasStack', { screen: 'IdeasList' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: "Explore" }}
      />
      <Tab.Screen
        name="CreateIdeaNavigator"
        component={CreateIdeaNavigator}
        options={{ 
          title: "Create",
          headerShown: false,
        }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            // Reset to the root screen of the stack when pressing the tab
            const routeName = getFocusedRouteNameFromRoute(route);
            if (routeName && routeName !== 'IdeaChoice') {
              e.preventDefault();
              navigation.navigate('CreateIdeaNavigator', { screen: 'IdeaChoice' });
            }
          },
        })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        options={{ title: "Me" }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            // Reset to the root screen of the stack when pressing the tab
            const routeName = getFocusedRouteNameFromRoute(route);
            if (routeName && routeName !== 'Profile') {
              e.preventDefault();
              navigation.navigate('ProfileNavigator', { screen: 'Profile' });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
