import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/signin'); // Navigate to SignIn screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="bus"
          size={200}
          color="#DB2777" // hard pink
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>Best Ticket Booking App</Text>
        <Text style={styles.caption}>Fast, simple & reliable travel booking</Text>
      </View>

      <TouchableOpacity onPress={handleGetStarted} style={styles.buttonWrapper}>
        <LinearGradient
          colors={['#DB2777', '#BE185D']} // strong pink gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 10,
  },
  caption: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
  },
  buttonWrapper: {
    width: width - 100,
    borderRadius: 30,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});
