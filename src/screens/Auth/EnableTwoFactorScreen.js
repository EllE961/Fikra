import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, firestore } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';

/**
 * This screen is optional, only for users who want 2FA.
 * They enter a phone, get OTP, verify OTP, and link phone to their account.
 */
const EnableTwoFactorScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('enterPhone'); // 'enterPhone' | 'verifyOtp'
  const [error, setError] = useState('');

  // Optional: reCAPTCHA on web requires special setup
  // For iOS/Android, you can directly use firebase.auth().verifyPhoneNumber if using RNFirebase
  // or firebase's "signInWithPhoneNumber" if using the JS SDK

  const handleSendCode = async () => {
    try {
      // Example using React Native Firebase approach:
      // const confirmation = await auth().signInWithPhoneNumber(phone.trim());

      // If using older "firebase/compat/app" + "react-native-firebase" 
      // you'd do something like:
      // const confirmation = await firebase.auth().signInWithPhoneNumber(phone.trim());

      // For simplicity, let's just store a placeholder
      // In a real app, you'd store confirmation.verificationId:
      const mockVerificationId = '123456';
      setVerificationId(mockVerificationId);

      // Move to next step
      setStep('verifyOtp');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyCode = async () => {
    try {
      // In real code:
      // const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
      // const userCredential = await auth.currentUser.linkWithCredential(credential);

      // For this example, we mock success if otp === "1234"
      if (otp.trim() === '1234') {
        // Mark phone as verified in Firestore
        const uid = auth.currentUser?.uid;
        if (uid) {
          await firestore.collection('users').doc(uid).set(
            {
              twoFA: {
                phoneNumber: phone.trim(),
                enabled: true,
              },
            },
            { merge: true }
          );
        }

        Alert.alert('Success', 'Your phone number is now verified and 2FA is enabled!');
        navigation.goBack(); // or navigate somewhere else
      } else {
        Alert.alert('Invalid Code', 'The OTP code is incorrect.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      {step === 'enterPhone' && (
        <>
          <Text style={styles.heading}>Enable 2FA - Step 1</Text>
          <Text style={styles.info}>Enter your phone number to receive a verification code.</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 234 567 8901"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Send Code" onPress={handleSendCode} />
        </>
      )}

      {step === 'verifyOtp' && (
        <>
          <Text style={styles.heading}>Enable 2FA - Step 2</Text>
          <Text style={styles.info}>We sent an OTP to {phone}. Enter it below:</Text>
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Verify Code" onPress={handleVerifyCode} />
        </>
      )}
    </View>
  );
};

export default EnableTwoFactorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20, fontWeight: '600', marginBottom: 12, textAlign: 'center',
  },
  info: {
    fontSize: 16, marginBottom: 12, textAlign: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12,
  },
  error: {
    color: 'red', textAlign: 'center', marginBottom: 12,
  },
});
