import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);
  const [showLoginSuccessMsg, setShowLoginSuccessMsg] = useState(false); // New state for login success message
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.loggedOut === 'true') {
      setShowLogoutMsg(true);
      setTimeout(() => setShowLogoutMsg(false), 4000);
    }
  }, [params.loggedOut]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setShowLoginSuccessMsg(true); // Show the success message

      // Set a timeout to hide the message and then navigate
      setTimeout(() => {
        setShowLoginSuccessMsg(true); // Hide the message
        router.replace({ pathname: '/home', params: { loggedIn: 'true' } });
      }, 1000); // Display the success message for 2 seconds
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {showLogoutMsg && (
        <Text style={styles.logoutMessage}>
          You have been logged out successfully.
        </Text>
      )}

      {showLoginSuccessMsg && ( // Conditionally render the success message
        <Text style={styles.successMessage}>
          Login successful! Redirecting...
        </Text>
      )}

      <Text style={styles.title}>Welcome Here!</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#8b8686"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError('');
        }}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#8b8686"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError('');
        }}
        style={styles.input}
        secureTextEntry
      />

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.linkText}>
        Don&#39;t have an account?{' '}
        <Link href="/signup" style={styles.link}>
          Sign Up
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc', // Background color
    justifyContent: 'center',
    padding: 24,
  },
  logoutMessage: {
    position: 'absolute',
    top: 100,
    left: 50,
    right: 50,
    backgroundColor: '#feb8b8ff', // lighter tone of secondary #e89d07
    paddingVertical: 18,
    borderRadius: 18,
    color: '#000000ff', // dark secondary shade
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '400',
    zIndex: 10,
    elevation: 10,
  },
  successMessage: { // New style for the login success message
    position: 'absolute',
    top: 100, // Adjusted position to avoid overlapping with logout message
    left: 40,
    right: 40,
    backgroundColor: '#e2fde8ff', // Light green for success
    paddingVertical: 18,
    borderRadius: 16,
    color: '#115b23ff', // Dark green text
    textAlign: 'center',
    fontSize: 18,
    zIndex: 10,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3a125d', // primary color
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#544d4d', // text color
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#3a125d', // primary color border
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#544d4d', // input text color
  },
  errorText: {
    color: '#b91c1c', // red error color
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#3a125d', // primary color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    color: '#eceefc', // background color for contrast (white-ish)
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#544d4d', // text color
  },
  link: {
    color: '#e89d07', // secondary color
    fontWeight: 'bold',
  },
});