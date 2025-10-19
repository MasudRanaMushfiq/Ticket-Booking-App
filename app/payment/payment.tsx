import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const totalPrice = params.totalPrice ? Number(params.totalPrice) : 0;
  const busId = params.busId as string;
  const busName = params.busName as string;
  const seatLabelsRaw = params.seatLabels as string;
  let seatLabels: string[] = [];
  try {
    seatLabels = seatLabelsRaw ? JSON.parse(seatLabelsRaw) : [];
  } catch {
    seatLabels = [];
  }

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passengerName, setPassengerName] = useState<string>('Passenger');

  useEffect(() => {
    if (auth.currentUser) {
      setPassengerName(auth.currentUser.displayName || 'Passenger');
    }
  }, []);

  const paymentOptions = [
    { key: 'mobile_banking', label: 'Mobile Banking', icon: <Ionicons name="phone-portrait" size={28} color="#3a125d" /> },
    { key: 'banking', label: 'Banking', icon: <MaterialCommunityIcons name="bank" size={28} color="#3a125d" /> },
    { key: 'card', label: 'Card', icon: <FontAwesome5 name="credit-card" size={26} color="#3a125d" /> },
  ];

  const handleMakePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Select Payment Method', 'Please choose a payment method first.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('User not logged in', 'Please login to make a booking.');
      return;
    }

    setLoading(true);
    const userId = auth.currentUser.uid;
    const bookingId = uuidv4();

    try {
      // 1️⃣ Create booking in 'bookings' collection
      const bookingRef = doc(db, 'bookings', bookingId);
      await setDoc(bookingRef, {
        bookingId,
        busId,
        userId,
        seatLabels,
        totalPrice,
        paymentMethod,
        passengerName,
        createdAt: serverTimestamp(),
      });

      // 2️⃣ Add booking ID to user's bookingIds array
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { bookingIds: arrayUnion(bookingId) });

      // 3️⃣ Add booked seats to bus's bookedSeats array
      const busRef = doc(db, 'buses', busId);
      const busSnap = await getDoc(busRef);
      const currentBookedSeats: string[] = busSnap.exists() && busSnap.data().bookedSeats ? busSnap.data().bookedSeats : [];
      await updateDoc(busRef, { bookedSeats: [...currentBookedSeats, ...seatLabels] });

      Alert.alert('Booking Successful', `Booking ID: ${bookingId}`);
      router.replace('/home'); // Navigate to home after successful booking
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Bus & Passenger Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Bus Name:</Text>
          <Text style={styles.infoValue}>{busName}</Text>

          <Text style={styles.infoLabel}>Passenger:</Text>
          <Text style={styles.infoValue}>{passengerName}</Text>

          <Text style={styles.infoLabel}>Seat(s):</Text>
          <Text style={styles.infoValue}>{seatLabels.join(', ')}</Text>

          <Text style={styles.infoLabel}>Total Price:</Text>
          <Text style={styles.priceValue}>৳ {totalPrice}</Text>
        </View>

        <Text style={styles.subtitle}>Select Payment Method</Text>

        <View style={styles.optionsContainer}>
          {paymentOptions.map(({ key, label, icon }) => {
            const selected = paymentMethod === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setPaymentMethod(key)}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>{icon}</View>
                <Text style={[styles.optionLabel, selected && { color: '#fff' }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.payButton, (!paymentMethod || loading) && { backgroundColor: '#999' }]}
          onPress={handleMakePayment}
          disabled={!paymentMethod || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.payButtonText}>{loading ? 'Processing...' : 'Make Payment'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc',
  },
  scrollContainer: {
    padding: 24,
    minHeight: SCREEN_HEIGHT - StatusBar.currentHeight!,
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  infoLabel: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#636060',
    fontWeight: '600',
    marginTop: 10,
  },
  infoValue: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#3a125d',
  },
  priceValue: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    color: '#0c893aff',
    marginTop: 5,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '600',
    color: '#3a125d',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#3a125d',
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  optionSelected: {
    backgroundColor: '#3a125d',
  },
  iconWrapper: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  optionLabel: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    color: '#3a125d',
  },
  payButton: {
    backgroundColor: '#3a125d',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonText: {
    color: '#eceefc',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
  },
});
