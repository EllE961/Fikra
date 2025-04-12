import React from 'react';
import * as Sentry from '@sentry/react-native';
import { View, Text, StyleSheet, Button } from 'react-native';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to Sentry
    Sentry.captureException(error);
    console.error('[GlobalErrorBoundary] Caught Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optionally reset your navigation or other states
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops, something went wrong!</Text>
          <Text style={styles.subtitle}>
            We're logging the issue. Please try again.
          </Text>
          <Button title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 8,
  },
  subtitle: {
    fontSize: 14, textAlign: 'center', marginBottom: 16,
  },
});
