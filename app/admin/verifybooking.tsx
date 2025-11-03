import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from 'firebase/firestore';

interface Booking {
  id: string;
  passengerName: string;
  userId: string;
  busId: string;
  seatLabels: string[];
  totalPrice: number;
  paymentMethod: string;
  paymentVerified: boolean;
  transactionId: string;
  createdAt?: Timestamp; // optional to handle missing field
  [key: string]: any;
}

export default function VerifyBookingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const colRef = collection(db, 'bookings');
      const snapshot = await getDocs(colRef);
      const data: Booking[] = [];

      snapshot.forEach((docSnap) => {
        const docData = docSnap.data();
        data.push({ id: docSnap.id, ...docData } as Booking);
      });

      // Sort by createdAt descending, putting docs without createdAt at the end
      data.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });

      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      Alert.alert('Error', 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleVerifyPayment = async (booking: Booking) => {
    try {
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, { paymentVerified: true });
      Alert.alert('Success', 'Payment verified!');
      fetchBookings(); // Refresh list
    } catch (err) {
      console.error('Error verifying payment:', err);
      Alert.alert('Error', 'Failed to verify payment.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#3B7CF5" style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#3B7CF5" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Booking</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {bookings.length === 0 ? (
          <Text style={styles.noBookings}>No bookings found.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <Text style={styles.label}>
                Name: <Text style={styles.value}>{booking.passengerName}</Text>
              </Text>
              <Text style={styles.label}>
                User ID: <Text style={styles.value}>{booking.userId}</Text>
              </Text>
              <Text style={styles.label}>
                Bus ID: <Text style={styles.value}>{booking.busId}</Text>
              </Text>
              <Text style={styles.label}>
                Seats: <Text style={styles.value}>{booking.seatLabels.join(', ')}</Text>
              </Text>
              <Text style={styles.label}>
                Total Price: <Text style={styles.value}>৳ {booking.totalPrice}</Text>
              </Text>
              <Text style={styles.label}>
                Payment Method: <Text style={styles.value}>{booking.paymentMethod}</Text>
              </Text>
              <Text style={styles.label}>
                Transaction ID: <Text style={styles.value}>{booking.transactionId}</Text>
              </Text>
              <Text style={styles.label}>
                Payment Verified: <Text style={styles.value}>{booking.paymentVerified ? 'Yes' : 'No'}</Text>
              </Text>
              <Text style={styles.label}>
                Created At:{' '}
                <Text style={styles.value}>
                  {booking.createdAt ? booking.createdAt.toDate().toLocaleString() : 'N/A'}
                </Text>
              </Text>

              {!booking.paymentVerified && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => handleVerifyPayment(booking)}
                >
                  <Text style={styles.verifyButtonText}>Verify Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eceefc' },
  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  noBookings: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#544d4d' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  label: { fontSize: 14, color: '#3B7CF5', marginBottom: 4 },
  value: { fontWeight: '600', color: '#544d4d' },
  verifyButton: {
    marginTop: 10,
    backgroundColor: '#3B7CF5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
