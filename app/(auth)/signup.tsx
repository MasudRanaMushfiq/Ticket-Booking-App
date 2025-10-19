import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName in Firebase Auth profile
      await updateProfile(user, {
        displayName: fullName,
      });

      // Save user data in Firestore with empty phone and gender fields
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone: '',   // silently keep phone empty
        gender: '',  // silently keep gender empty
        createdAt: serverTimestamp(),
        bookingIds: [],
      });

      setSuccessMsg(`Account created successfully for ${user.email}`);

      setTimeout(() => {
        router.replace('/signin');
      }, 1500);
    } catch (error) {
      let message = 'An unknown error occurred.';
      if (error instanceof Error) message = error.message;
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us by filling in your details</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#8b8686"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#8b8686"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#8b8686"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading ? styles.buttonDisabled : {}]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.linkText}>
        Already have an account?{' '}
        <Link href="/signin" style={styles.link}>
          Sign In
        </Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3a125d',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#544d4d',
    marginBottom: 25,
  },
  input: {
    height: 50,
    borderColor: '#3a125d',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#544d4d',
  },
  button: {
    backgroundColor: '#3a125d',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#636060',
  },
  buttonText: {
    color: '#eceefc',
    fontSize: 17,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 25,
    textAlign: 'center',
    color: '#544d4d',
  },
  link: {
    color: '#e89d07',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  successText: {
    color: '#3a6e00',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});


