import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig'; // Adjust path if needed

export default function SplashScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true); // Loading state while checking auth

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already logged in — go to home
        router.replace('/home');
      } else {
        // Not logged in — stop loading, show splash
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (checkingAuth) {
    // Show loader while checking auth
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#3a125d" />
        <Image
          source={require('@/assets/images/image.png')}
          style={styles.busImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>
          <Text style={styles.whiteText}>Bus</Text>
          <Text style={styles.secondaryText}>Trip</Text>
        </Text>
        <Text style={styles.subtitle}>Book Your Bus Ticket</Text>
        <ActivityIndicator size="large" color="#e89d07" style={{ marginTop: 30 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3a125d" />

      {/* Bus Image */}
      <Image
        source={require('@/assets/images/image.png')}
        style={styles.busImage}
        resizeMode="contain"
      />

      {/* Centered Text */}
      <View style={styles.textContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.whiteText}>Bus</Text>
          <Text style={styles.secondaryText}>Trip</Text>
        </Text>
        <Text style={styles.subtitle}>Book Your Bus Ticket</Text>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.getStartedBtn}
        onPress={() => router.replace('/signin')}
      >
        <Text style={styles.getStartedText}>Get Started</Text>
        <Feather name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a125d', // Primary Color
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  busImage: {
    width: 200,
    height: 200,
    tintColor: '#fff',
    marginBottom: -30,
    marginTop: -70,
  },
  textContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#e89d07', // Secondary Color
  },
  subtitle: {
    fontSize: 16,
    color: '#eceefc', // Background Color for contrast
    letterSpacing: 1,
  },
  getStartedBtn: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: '#e89d07', // Secondary Color
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});
