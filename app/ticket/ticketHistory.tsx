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
import { collection, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';

interface Booking {
  id: string;
  from: string;
  to: string;
  seat: string;
  date: Timestamp;
  price: number;
  busId?: string;
}

export default function TicketHistory() {
  const router = useRouter();
  const [bookings, setBookings] = useState<(Booking & { busName?: string })[]>([]);
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
        const userRef = doc(db, 'users', user.uid);
        const bookingSnapshot = await getDocs(collection(userRef, 'bookings'));

        const busNameCache: Record<string, string> = {};
        const userBookings: (Booking & { busName?: string })[] = [];

        for (const docSnap of bookingSnapshot.docs) {
          const booking = { id: docSnap.id, ...docSnap.data() } as Booking;
          let busName = '';

          if (booking.busId) {
            if (busNameCache[booking.busId]) {
              busName = busNameCache[booking.busId];
            } else {
              const busDoc = await getDoc(doc(db, 'buses', booking.busId));
              if (busDoc.exists()) {
                const busData = busDoc.data();
                busName = busData.busName || '';
                busNameCache[booking.busId] = busName;
              }
            }
          }

          userBookings.push({ ...booking, busName });
        }

        setBookings(userBookings);
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const passedBookings = bookings.filter(
    (ticket) => ticket.date.toDate() < today
  );
  const upcomingBookings = bookings.filter(
    (ticket) => ticket.date.toDate() >= today
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Purple Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ticket History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Upcoming Tickets Section */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcomingBookings.length === 0 ? (
          <Text style={styles.noTicket}>No upcoming tickets.</Text>
        ) : (
          upcomingBookings.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <Text style={styles.route}>
                {ticket.from} → {ticket.to}
              </Text>
              {ticket.busName ? (
                <Text style={styles.busName}>Bus: {ticket.busName}</Text>
              ) : (
                <Text style={styles.busName}>Bus: Unknown</Text>
              )}
              <Text style={styles.detail}>Seat: {ticket.seat}</Text>
              <Text style={styles.detail}>
                Date: {ticket.date.toDate().toDateString()}
              </Text>
              <Text style={styles.detail}>Price: ৳ {ticket.price}</Text>
            </View>
          ))
        )}

        {/* Passed Tickets Section */}
        <Text style={styles.sectionTitle}>Passed</Text>
        {passedBookings.length === 0 ? (
          <Text style={styles.noTicket}>No passed tickets.</Text>
        ) : (
          passedBookings.map((ticket) => (
            <View key={ticket.id} style={styles.ticketCard}>
              <Text style={styles.route}>
                {ticket.from} → {ticket.to}
              </Text>
              {ticket.busName ? (
                <Text style={styles.busName}>Bus: {ticket.busName}</Text>
              ) : (
                <Text style={styles.busName}>Bus: Unknown</Text>
              )}
              <Text style={styles.detail}>Seat: {ticket.seat}</Text>
              <Text style={styles.detail}>
                Date: {ticket.date.toDate().toDateString()}
              </Text>
              <Text style={styles.detail}>Price: ৳ {ticket.price}</Text>
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
    backgroundColor: '#eceefc', // background color from palette
  },
  header: {
    backgroundColor: '#3a125d', // purple primary color
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 40,
    color: '#3a125d', // primary color
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#544d4d', // text color
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
  route: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a125d', // primary color for route
    marginBottom: 6,
  },
  busName: {
    fontSize: 15,
    color: '#544d4d', // text color
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#636060', // disabled color
    marginBottom: 2,
  },
  noTicket: {
    fontSize: 16,
    color: '#64748b', // lighter text
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});
