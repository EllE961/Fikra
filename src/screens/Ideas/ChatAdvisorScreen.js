import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

const ChatAdvisorScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Set up title in navigation header
  React.useEffect(() => {
    navigation.setOptions({
      title: 'AI Business Advisor',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.placeholder, { color: colors.text }]}>
          AI Business Advisor
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ChatAdvisorScreen; 
