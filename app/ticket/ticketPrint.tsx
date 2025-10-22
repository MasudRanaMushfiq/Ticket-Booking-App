import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrintTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ticket, setTicket] = useState<any>(null);
  const [busInfo, setBusInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestTicket = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace('/signin');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert('Error', 'User not found.');
          return;
        }

        const userData = userSnap.data();
        const bookingIds = userData.bookingIds || [];

        if (bookingIds.length === 0) {
          Alert.alert('No Ticket', 'No tickets found for this user.');
          return;
        }

        const latestBookingId = bookingIds[bookingIds.length - 1];
        const bookingRef = doc(db, 'bookings', latestBookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          const bookingData = bookingSnap.data();
          setTicket(bookingData);

          if (bookingData.busId) {
            const busRef = doc(db, 'buses', bookingData.busId);
            const busSnap = await getDoc(busRef);
            if (busSnap.exists()) {
              setBusInfo(busSnap.data());
            }
          }
        } else {
          Alert.alert('Error', 'Booking not found.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTicket();
  }, [router]);

  const handlePrintPDF = async () => {
    try {
      if (!ticket) return;

      const qrData = `Booking ID: ${ticket.bookingId}\nBus: ${busInfo?.busName || ticket.busId}\nSeats: ${ticket.seatLabels.join(
        ', '
      )}\nFare: ৳${ticket.totalPrice}`;

      const busDate =
        busInfo?.date?.seconds
          ? new Date(busInfo.date.seconds * 1000).toLocaleString()
          : busInfo?.date || 'Not Available';

      const htmlTicketOnly = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #eceefc;">
            <div style="max-width:600px; margin:auto; background:#fff; border-radius:20px; padding:30px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
              <h1 style="text-align:center; color:#3a125d;">🎫 Bus Ticket</h1>
              <hr style="border:1px dashed #ccc; margin:20px 0;">
              <p><strong>Bus Name:</strong> ${busInfo?.busName || 'Unknown Bus'}</p>
              <p><strong>From:</strong> ${busInfo?.from || 'N/A'}</p>
              <p><strong>To:</strong> ${busInfo?.to || 'N/A'}</p>
              <p><strong>Departure Date & Time:</strong> ${busDate}</p>
              <p><strong>Bus Type:</strong> ${busInfo?.isAC ? 'AC' : 'Non-AC'}</p>
              <hr style="border:1px dashed #ccc; margin:20px 0;">
              <p><strong>Passenger:</strong> ${ticket.passengerName}</p>
              <p><strong>Seat(s):</strong> ${ticket.seatLabels.join(', ')}</p>
              <p><strong>Total Fare:</strong> ৳${ticket.totalPrice}</p>
              <p><strong>Transaction ID:</strong> ${ticket.transactionId || 'N/A'}</p>
              <p><strong>Booking Time:</strong> ${new Date(
                ticket.createdAt?.seconds * 1000
              ).toLocaleString()}</p>
              <p><strong>Booking ID:</strong> ${ticket.bookingId}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:40px;">
                <div style="color:#3a125d; font-weight:bold; font-size:16px;">
                  <p>✨ Safe Journey! <br/>Have a wonderful trip! 🌿</p>
                </div>
                <div>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                    qrData
                  )}&size=120x120" alt="QR Code" />
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({ html: htmlTicketOnly });

      // ✅ After successful print/download, redirect to home page
      router.replace('/home');
    } catch (error) {
      console.error('Print Error:', error);
      Alert.alert('Error', 'Failed to print ticket.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#3a125d" />
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.noTicket}>No ticket available.</Text>
      </SafeAreaView>
    );
  }

  const busDate =
    busInfo?.date?.seconds
      ? new Date(busInfo.date.seconds * 1000).toLocaleString()
      : busInfo?.date || 'Not Available';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3B7CF5" />
      {/* ================== Header ================== */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Ticket</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.ticketCard}>
          <Text style={styles.label}>Bus Name:</Text>
          <Text style={styles.value}>{busInfo?.busName || 'Unknown Bus'}</Text>

          <Text style={styles.label}>From → To:</Text>
          <Text style={styles.value}>
            {busInfo?.from || 'N/A'} → {busInfo?.to || 'N/A'}
          </Text>

          <Text style={styles.label}>Departure Date & Time:</Text>
          <Text style={styles.value}>{busDate}</Text>

          <Text style={styles.label}>Bus Type:</Text>
          <Text style={styles.value}>{busInfo?.isAC ? 'AC' : 'Non-AC'}</Text>

          <Text style={styles.label}>Passenger:</Text>
          <Text style={styles.value}>{ticket.passengerName}</Text>

          <Text style={styles.label}>Seat(s):</Text>
          <Text style={styles.value}>{ticket.seatLabels.join(', ')}</Text>

          <Text style={styles.label}>Fare:</Text>
          <Text style={[styles.value, { color: '#0c893a' }]}>{`৳ ${ticket.totalPrice}`}</Text>

          <Text style={styles.label}>Booking Time:</Text>
          <Text style={styles.value}>{new Date(ticket.createdAt?.seconds * 1000).toLocaleString()}</Text>

          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{ticket.transactionId || 'N/A'}</Text>

          <View style={styles.ticketBottom}>
            <Text style={styles.wishText}>✨ Safe Journey! Have a nice trip!</Text>
            <QRCode
              value={`Booking ID: ${ticket.bookingId}\nBus: ${busInfo?.busName || ticket.busId}\nSeats: ${ticket.seatLabels.join(', ')}\nFare: ৳${ticket.totalPrice}`}
              size={90}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.downloadButton} onPress={handlePrintPDF}>
          <Text style={styles.downloadButtonText}>🖨️ Print Ticket</Text>
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
  /* ================== Header ================== */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B7CF5',
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    elevation: 4,
  },
  backButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    padding: 24,
    alignItems: 'center',
  },
  ticketCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#544d4d',
    fontWeight: '600',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#3a125d',
    fontWeight: '700',
  },
  ticketBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  wishText: {
    fontSize: 14,
    color: '#3a125d',
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#3a125d',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  noTicket: {
    color: '#544d4d',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 40,
  },
});
