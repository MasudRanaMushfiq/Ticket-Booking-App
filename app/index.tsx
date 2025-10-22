import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Bus Image - Bigger, white */}
      <Image
        source={require('@/assets/images/image.png')} // Your bus image path
        style={styles.busImage}
        resizeMode="contain"
      />

      {/* Centered Text Container */}
      <View style={styles.textContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.whiteText}>Bus</Text>
          <Text style={styles.secondaryText}>Trip</Text>
        </Text>
        <Text style={styles.subtitle}>Book Your Bus Ticket</Text>
      </View>

      {/* Get Started Button */}
      <TouchableOpacity style={styles.getStartedBtn} onPress={() => router.replace('/signin')}>
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
    tintColor: '#fff', // make image white
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



// for my project always follow this color code Color Palette
// Primary Color #3a125d
// Secondary Color #e89d07
// Background Color #eceefc
// Text Color #544d4d
// Disable Color #636060