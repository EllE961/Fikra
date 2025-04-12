import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import {auth} from '../../services/firebase';
import {useNavigation} from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    try {
      await auth.sendPasswordResetEmail(email.trim());
      alert('Password reset link sent. Check your email!');
      navigation.goBack();
    } catch (error) {
      console.log('Password reset error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <Button title="Send Reset Email" onPress={handlePasswordReset} />
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22, fontWeight: '600', marginBottom: 16, textAlign: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12,
  },
});
