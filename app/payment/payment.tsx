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
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const generateRandomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

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
  const [transactionId, setTransactionId] = useState('');
  const [passengerName, setPassengerName] = useState<string>('Passenger');

  useEffect(() => {
    if (auth.currentUser) {
      setPassengerName(auth.currentUser.displayName || 'Passenger');
    }
  }, []);

  const paymentOptions = [
    { key: 'mobile_banking', label: 'Mobile Banking', icon: <Ionicons name="phone-portrait" size={28} color="#3a125d" /> },
  ];

  const handleMakePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Select Payment Method', 'Please choose a payment method first.');
      return;
    }
    if (!transactionId.trim()) {
      Alert.alert('Transaction ID Missing', 'Please enter your transaction ID before proceeding.');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('User not logged in', 'Please login to make a booking.');
      return;
    }

    setLoading(true);
    const userId = auth.currentUser.uid;
    const bookingId = generateRandomId();

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await setDoc(bookingRef, {
        bookingId,
        busId,
        userId,
        seatLabels,
        totalPrice,
        paymentMethod,
        passengerName,
        transactionId,
        createdAt: serverTimestamp(),
        paymentVerified: false,
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { bookingIds: arrayUnion(bookingId) });

      const busRef = doc(db, 'buses', busId);
      const busSnap = await getDoc(busRef);
      const currentBookedSeats: string[] = busSnap.exists() && busSnap.data().bookedSeats ? busSnap.data().bookedSeats : [];
      await updateDoc(busRef, { bookedSeats: [...currentBookedSeats, ...seatLabels] });

      router.replace({
        pathname: '/ticket/ticketPrint',
        params: { bookingId },
      });
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3B7CF5" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Info Card */}
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

        {/* Transaction ID Field */}
        <View style={styles.transactionContainer}>
          <Text style={styles.infoLabel}>Transaction ID:</Text>
          <TextInput
            style={styles.transactionInput}
            placeholder="Enter your transaction ID"
            placeholderTextColor="#888"
            value={transactionId}
            onChangeText={setTransactionId}
          />
        </View>

        {/* Pay Button */}
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
  safeArea: { flex: 1, backgroundColor: '#eceefc' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B7CF5',
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    elevation: 4,
  },
  backButton: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center', flex: 1 },

  scrollContainer: {
    padding: 24,
    minHeight: SCREEN_HEIGHT - StatusBar.currentHeight!,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15, // Reduced margin for compactness
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  infoLabel: { fontSize: SCREEN_WIDTH * 0.045, color: '#636060', fontWeight: '600', marginTop: 10 },
  infoValue: { fontSize: SCREEN_WIDTH * 0.05, fontWeight: '700', color: '#3a125d' },
  priceValue: { fontSize: SCREEN_WIDTH * 0.055, fontWeight: '700', color: '#0c893aff', marginTop: 5 },

  subtitle: { fontSize: SCREEN_WIDTH * 0.055, fontWeight: '600', color: '#3a125d', marginBottom: 10, textAlign: 'center' },

  optionsContainer: { marginBottom: 15 }, // Reduced for compactness
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#3a125d',
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  optionSelected: { backgroundColor: '#3a125d' },
  iconWrapper: { width: 30, alignItems: 'center', marginRight: 15 },
  optionLabel: { fontSize: SCREEN_WIDTH * 0.045, fontWeight: '600', color: '#3a125d' },

  transactionContainer: { marginBottom: 15 }, // Reduced spacing
  transactionInput: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#3a125d',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3a125d',
  },

  payButton: { backgroundColor: '#3B7CF5', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  payButtonText: { color: '#fff', fontSize: SCREEN_WIDTH * 0.05, fontWeight: '700' },
});
