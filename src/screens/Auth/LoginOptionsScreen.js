import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const LoginOptionsScreen = () => {
  const navigation = useNavigation();
  
  // Determine which auth providers to show based on platform
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  
  // Show Google on Android and Web
  const showGoogle = isAndroid || isWeb;
  // Show Apple on iOS and Web
  const showApple = isIOS || isWeb;

  const handleEmailSignIn = () => {
    navigation.navigate('EmailLogin');
  };

  const handleGoogleSignIn = async () => {
    // Add Google sign-in logic
    console.log('TODO: Google Sign-In');
  };

  const handleAppleSignIn = async () => {
    // Add Apple sign-in logic
    console.log('TODO: Apple Sign-In');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Fikra Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/icons/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Welcome to Fikra!</Text>
          <Text style={styles.subtitle}>AI-Powered Business Idea Generator</Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Email */}
          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={handleEmailSignIn}>
            <Text style={styles.buttonText}>Sign in with Email</Text>
          </TouchableOpacity>

          {/* Google - only on Android and Web */}
          {showGoogle && (
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleSignIn}>
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>
          )}

          {/* Apple - only on iOS and Web */}
          {showApple && (
            <TouchableOpacity
              style={[styles.button, styles.appleButton]}
              onPress={handleAppleSignIn}>
              <Text style={styles.buttonText}>Continue with Apple</Text>
            </TouchableOpacity>
          )}

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              By continuing, you agree to our{' '}
            </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>User Agreement</Text>
            </TouchableOpacity>
            <Text style={styles.disclaimerText}> and </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.disclaimerText}>.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginOptionsScreen;

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingTop: 50,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 60,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 10,
  },
  logoContainer: {
    width: width * 0.35,
    height: width * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.28,
    height: width * 0.28,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F3354',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5D5FEF',
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  emailButton: { backgroundColor: '#5D5FEF' },
  googleButton: { backgroundColor: '#4285F4' },
  appleButton: { backgroundColor: '#000' },
  buttonText: {
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'center',
  },
  disclaimerText: {
    fontSize: 13, 
    color: '#999',
  },
  linkText: {
    fontSize: 13, 
    color: '#5D5FEF', 
    textDecorationLine: 'underline',
  },
});
