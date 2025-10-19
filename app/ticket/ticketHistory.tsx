import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

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
        // 1️⃣ Get bookingIds from user document
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

        // 2️⃣ Fetch each booking from bookings collection
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#3a125d" />
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ticket History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {bookings.length === 0 ? (
          <Text style={styles.noTicket}>You have no tickets booked.</Text>
        ) : (
          bookings.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <Text style={styles.busName}>
                Bus: {ticket.busName || 'Unknown'} ({ticket.acType || 'Type Unknown'})
              </Text>
              <Text style={styles.detail}>
                Seats: {ticket.seatLabels.join(', ')}
              </Text>
              <Text style={styles.detail}>
                Payment: {ticket.paymentMethod}
              </Text>
              <Text style={styles.detail}>
                Total Price: ৳ {ticket.totalPrice}
              </Text>
              {ticket.createdAt && (
                <Text style={styles.detail}>
                  Booking Date: {formatFullDateTime(ticket.createdAt)}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 35,
    backgroundColor: '#eceefc',
  },
  header: {
    backgroundColor: '#3a125d',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
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
  busName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3a125d',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#544d4d',
    marginBottom: 2,
  },
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
