import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,} from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);
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
      router.replace({ pathname: '/home', params: { loggedIn: 'true' } });
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

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => {setEmail(text);setError('');}}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => {setPassword(text);setError('');}}
        style={styles.input}
        secureTextEntry
      />

      {/* Error shown below password input */}
      {error !== '' && <Text style={styles.errorText}>{error}</Text>} 

      {showLogoutMsg && (
        <Text style={styles.logoutMessage}>
         You have been logged out successfully.
      </Text>)}


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
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    padding: 24,
  },
  logoutMessage: {
  position: 'absolute',
  top: 50,
  left: 0,
  right: 0,
  backgroundColor: '#fee2e2',
  padding: 10,
  marginHorizontal: 20,
  borderRadius: 8,
  color: '#b91c1c',
  textAlign: 'center',
  fontSize: 14,
  zIndex: 10,
  elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#2563eb',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#475569',
  },
  link: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});


