import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function SignInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);
  const [showLoginSuccessMsg, setShowLoginSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

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
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setShowLoginSuccessMsg(true);
      setTimeout(() => {
        setShowLoginSuccessMsg(false);
        router.replace({ pathname: '/home', params: { loggedIn: 'true' } });
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError('');
      alert(`Password reset email sent to ${email}`);
      router.replace('/signin');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Here!</Text>
      <Text style={styles.subtitle}>
        {forgotPassword
          ? 'Enter your email to reset password'
          : 'Sign in to continue'}
      </Text>

      <Text style={styles.label}>Email</Text>
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
      />

      {!forgotPassword && (
        <>
          <Text style={styles.label}>Password</Text>
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

          {/* Forgot Password link */}
          <TouchableOpacity
            onPress={() => setForgotPassword(true)}
            style={styles.forgotWrapper}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </>
      )}

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      {!forgotPassword ? (
        <>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.linkText}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={styles.link}>
              Register
            </Link>
          </Text>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setForgotPassword(false)}>
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3a125d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#544d4d',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#3a125d',
    fontWeight: '600',
    marginBottom: 5,
    marginLeft: 5,
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
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#3a125d',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#eceefc',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotText: {
    color: '#e89d07',
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#544d4d',
  },
  link: {
    color: '#e89d07',
    fontWeight: 'bold',
  },
  backText: {
    color: '#3B7CF5',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
  },
});
