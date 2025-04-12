// src/components/PasswordStrength.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import zxcvbn from 'zxcvbn';

const PasswordStrength = ({ password }) => {
  const result = zxcvbn(password);
  const score = result.score; // score 0 to 4
  const feedback = result.feedback.suggestions.join(' ') || 'Good password';

  return (
    <View style={styles.container}>
      <Text style={styles.score}>Strength Score: {score}</Text>
      <Text style={styles.feedback}>{feedback}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  score: { fontSize: 14, fontWeight: '600', color: '#5D5FEF' },
  feedback: { fontSize: 12, color: '#777' },
});

export default PasswordStrength;
