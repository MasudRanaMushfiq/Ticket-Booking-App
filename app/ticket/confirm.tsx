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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

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
            if (data.fullName) {
              setFullName(data.fullName);
            }
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
        acType: acType || 'Non AC', // ✅ Send AC type forward
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.card}>
              {/* User Info */}
              <View style={styles.topSection}>
                <Ionicons name="person-circle-outline" size={48} color="#3a125d" />
                <View style={styles.passengerInfo}>
                  <Text style={styles.label}>Name:</Text>
                  <Text style={styles.userName}>{fullName}</Text>
                </View>
              </View>

              {/* Solid Line */}
              <View style={styles.solidLine} />

              {/* Booked Seat Info */}
              <View style={styles.seatContainer}>
                <Text style={styles.label}>Booked Seat:</Text>
                <View style={styles.seatWrap}>
                  {seatLabels.map((seat) => (
                    <View key={seat} style={styles.seatBox}>
                      <Text style={styles.seatText}>{seat}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Solid Line */}
              <View style={styles.solidLine} />

              {/* Bus Info */}
              <View style={styles.bottomSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="bus" size={24} color="#e89d07" style={styles.icon} />
                  <Text style={styles.infoText}>{busName || 'Bus Name'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={24}
                    color="#3a125d"
                    style={styles.icon}
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
                  <Ionicons name="snow-outline" size={24} color="#0093e9" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {acType?.toString().toUpperCase() === 'AC' ? 'AC Bus' : 'Non-AC Bus'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={24} color="#0c893aff" style={styles.icon} />
                  <Text style={styles.infoText}>Price per seat: ৳ {price}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={24} color="#3a125d" style={styles.icon} />
                  <Text style={[styles.infoText, { fontWeight: '800', fontSize: 20 }]}>
                    Total Price: ৳ {Number(price) * seatLabels.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={handlePayment}>
              <Text style={styles.buttonText}>Continue Purchase</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#636060',
    fontWeight: '600',
    marginBottom: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3a125d',
  },
  solidLine: {
    height: 1,
    backgroundColor: '#3a125d',
    marginVertical: 20,
  },
  seatContainer: {
    marginBottom: 10,
  },
  seatWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seatBox: {
    backgroundColor: '#3a125d10',
    borderColor: '#3a125d',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  seatText: {
    fontSize: 16,
    color: '#3a125d',
    fontWeight: '600',
  },
  bottomSection: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  icon: {
    marginRight: 15,
  },
  infoText: {
    fontSize: 18,
    color: '#3a125d',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3a125d',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#eceefc',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: 'red',
    fontWeight: '700',
  },
});
