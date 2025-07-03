import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import {
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { from, to, date, seatLabel, price, busId } = params;

  const [userName, setUserName] = useState('Loading...');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || 'Guest');
    } else {
      setUserName('Guest');
    }
  }, [user]);

  const handleBackHome = async () => {
    try {
      if (!user) throw new Error('User not logged in');
      if (!busId || typeof busId !== 'string') {
        Alert.alert('Error', 'Bus ID is missing or invalid.');
        return;
      }
      if (!seatLabel || typeof seatLabel !== 'string') {
        Alert.alert('Error', 'Seat is missing or invalid.');
        return;
      }

      const bookingData = {
        from,
        to,
        date: date ? new Date(date as string) : null,
        seat: seatLabel,
        price: price ? Number(price) : 0,
        busId,
        createdAt: serverTimestamp(),
      };

      const userRef = doc(db, 'users', user.uid);
      const bookingsRef = collection(userRef, 'bookings');

      // Add booking to user's subcollection
      const bookingDocRef = await addDoc(bookingsRef, bookingData);
      const bookingId = bookingDocRef.id;

      // Add booking ID to user's array
      await updateDoc(userRef, {
        bookingIds: arrayUnion(bookingId),
      });

      // Update the bus's bookedSeats list
      const busRef = doc(db, 'buses', busId);
      await updateDoc(busRef, {
        bookedSeats: arrayUnion(seatLabel),
      });

      Alert.alert('Success', 'Your ticket is confirmed!');
      router.replace('/home');
    } catch (err: any) {
      console.error('Booking error:', err);
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  if (!busId || typeof busId !== 'string') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ fontSize: 20, color: 'red', textAlign: 'center' }}>
          Error: Bus ID is missing or invalid.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.ticketCard}>
        <View style={styles.header}>
          <Ionicons name="bus" size={40} color="#16A34A" />
          <Text style={styles.title}>Bus Ticket Receipt</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Passenger</Text>
          <Text style={styles.value}>{userName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{from}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>To</Text>
          <Text style={styles.value}>{to}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            {date ? new Date(date as string).toDateString() : 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Seat</Text>
          <Text style={styles.value}>{seatLabel}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>৳ {price}</Text>
        </View>

        <View style={styles.divider} />
        <Text style={styles.thankYou}>Thank you for booking with Green Line!</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleBackHome}>
        <Text style={styles.buttonText}>Confirm & Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    justifyContent: 'center',
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#16A34A',
  },
  divider: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    marginVertical: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '700',
  },
  thankYou: {
    textAlign: 'center',
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 12,
  },
  button: {
    marginTop: 40,
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});



