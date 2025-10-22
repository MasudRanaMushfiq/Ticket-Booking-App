import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Booking {
  id: string;
  busId: string;
  userId: string;
  seatLabels: string[];
  totalPrice: number;
  paymentMethod: string;
  createdAt?: any;
}

export default function TicketHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<(Booking & { busName?: string; acType?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/signin');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          setErrorMsg('User not found.');
          setLoading(false);
          return;
        }

        const bookingIds: string[] = userSnap.data().bookingIds || [];
        if (bookingIds.length === 0) {
          setBookings([]);
          setLoading(false);
          return;
        }

        const busInfoCache: Record<string, { busName: string; acType: string }> = {};
        const fetchedBookings: (Booking & { busName?: string; acType?: string })[] = [];

        for (const bookingId of bookingIds) {
          const bookingDocRef = doc(db, 'bookings', bookingId);
          const bookingSnap = await getDoc(bookingDocRef);
          if (!bookingSnap.exists()) continue;

          const booking = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

          // Get bus info
          let busName = '';
          let acType = '';
          if (booking.busId) {
            if (busInfoCache[booking.busId]) {
              ({ busName, acType } = busInfoCache[booking.busId]);
            } else {
              const busSnap = await getDoc(doc(db, 'buses', booking.busId));
              if (busSnap.exists()) {
                const busData = busSnap.data();
                busName = busData.busName || '';
                acType = busData.acType || '';
                busInfoCache[booking.busId] = { busName, acType };
              }
            }
          }

          fetchedBookings.push({ ...booking, busName, acType });
        }

        setBookings(fetchedBookings);
      } catch (error) {
        console.error(error);
        setErrorMsg('Failed to load tickets.');
      }

      setLoading(false);
    };

    fetchBookings();
  }, [router]);

  const formatFullDateTime = (date: any) =>
    date?.toDate
      ? date.toDate().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : 'Unknown';

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket History</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {bookings.length === 0 ? (
          <Text style={styles.noTicket}>You have no tickets booked.</Text>
        ) : (
          bookings.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <View style={styles.row}>
                <Text style={styles.label}>Bus:</Text>
                <Text style={styles.value}>{ticket.busName || 'Unknown'} ({ticket.acType || 'Type Unknown'})</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Seats:</Text>
                <Text style={styles.value}>{ticket.seatLabels.join(', ')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Payment:</Text>
                <Text style={styles.value}>{ticket.paymentMethod}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Total Price:</Text>
                <Text style={styles.value}>৳ {ticket.totalPrice}</Text>
              </View>
              {ticket.createdAt && (
                <View style={styles.row}>
                  <Text style={styles.label}>Booking Date:</Text>
                  <Text style={styles.value}>{formatFullDateTime(ticket.createdAt)}</Text>
                </View>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    marginBottom: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },

  container: { paddingHorizontal: 20, paddingBottom: 50 },
  ticketCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: 120, fontWeight: '600', color: '#3B7CF5' },
  value: { flex: 1, color: '#544d4d' },

  noTicket: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});
