import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const { from, to, date, seatLabels: seatLabelsRaw, price, busId, busName, acType } = params;

  const [fullName, setFullName] = useState('You');

  let seatLabels: string[] = [];
  try {
    seatLabels = seatLabelsRaw ? JSON.parse(seatLabelsRaw as string) : [];
  } catch {
    seatLabels = [];
  }

  useEffect(() => {
    async function fetchUserFullName() {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.fullName) setFullName(data.fullName);
          }
        } catch (error) {
          console.error('Error fetching user fullName:', error);
        }
      }
    }
    fetchUserFullName();
  }, []);

  const handlePayment = () => {
    const totalPrice = Number(price) * seatLabels.length;

    router.push({
      pathname: '/payment/payment',
      params: {
        from,
        to,
        date,
        busId,
        busName,
        acType: acType || 'Non AC',
        seatLabels: JSON.stringify(seatLabels),
        passengerNames: JSON.stringify([fullName]),
        totalPrice: totalPrice.toString(),
      },
    });
  };

  if (!busId || typeof busId !== 'string') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[styles.errorText, { fontSize: 20, textAlign: 'center' }]}>
          Error: Bus ID is missing or invalid.
        </Text>
      </SafeAreaView>
    );
  }

  const farePerSeat = Number(price);
  const totalFare = farePerSeat * seatLabels.length;
  const onlineCost = totalFare * 0.05; // Example 5% online fee
  const vat = totalFare * 0.10; // Example 10% VAT
  const grandTotal = totalFare + onlineCost + vat;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B7CF5" />

      {/* ================== Header ================== */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Confirm Your Booking</Text>

        <View style={{ width: 32 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: SCREEN_HEIGHT * 0.05 }}
          >
            {/* Top Card: Passenger & Seat Info */}
            <View style={styles.card}>
              <View style={styles.topSection}>
                <Ionicons name="person-circle-outline" size={48} color="#3B7CF5" />
                <View style={{ marginLeft: 15, flex: 1 }}>
                  <Text style={styles.label}>Passenger:</Text>
                  <Text style={styles.userName}>{fullName}</Text>
                </View>
              </View>

              <View style={styles.solidLine} />

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={24} color="#e89d07" />
                <Text style={styles.infoText}>{from} → {to}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={24}
                  color="#3a125d"
                />
                <Text style={styles.infoText}>
                  {date
                    ? new Date(date as string).toLocaleDateString('en-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="bus" size={24} color="#0093e9" />
                <Text style={styles.infoText}>{busName || 'Bus Name'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="snow-outline" size={24} color="#0093e9" />
                <Text style={styles.infoText}>
                  {acType?.toString().toUpperCase() === 'AC' ? 'AC Bus' : 'Non-AC Bus'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="pricetag-outline" size={24} color="#3B7CF5" />
                <Text style={styles.infoText}>
                  Seats: {seatLabels.join(', ')}
                </Text>
              </View>
            </View>

            {/* Bottom Card: Fare Details */}
            <View style={styles.card}>
              <Text style={[styles.sectionTitle]}>Fare Details</Text>

              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Fare per seat</Text>
                <Text style={styles.fareValue}>৳ {farePerSeat}</Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Seats ({seatLabels.length})</Text>
                <Text style={styles.fareValue}>৳ {totalFare}</Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Online Charge (5%)</Text>
                <Text style={styles.fareValue}>৳ {onlineCost.toFixed(2)}</Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>VAT (10%)</Text>
                <Text style={styles.fareValue}>৳ {vat.toFixed(2)}</Text>
              </View>

              <View style={styles.solidLine} />

              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { fontSize: 18, fontWeight: '800' }]}>
                  Total
                </Text>
                <Text style={[styles.fareValue, { fontSize: 18, fontWeight: '800' }]}>
                  ৳ {grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={handlePayment}>
              <Text style={styles.buttonText}>Continue Purchase</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc',
  },

  /* ================== Header ================== */
  header: {
    backgroundColor: '#3B7CF5',
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#636060',
    fontWeight: '600',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B7CF5',
  },
  solidLine: {
    height: 1,
    backgroundColor: '#3B7CF5',
    marginVertical: 15,
    opacity: 0.2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B7CF5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B7CF5',
    marginBottom: 15,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  fareLabel: {
    fontSize: 16,
    color: '#636060',
  },
  fareValue: {
    fontSize: 16,
    color: '#3B7CF5',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginVertical: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: 'red',
    fontWeight: '700',
  },
});
