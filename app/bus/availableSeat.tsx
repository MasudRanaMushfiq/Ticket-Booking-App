import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  runTransaction,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Seat {
  id: number;
  label: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Utility to constrain width
const constrainedWidth = (width: number, min: number, max: number) => {
  return Math.max(min, Math.min(width, max));
};

export default function AvailableSeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const busId = params.busId as string;
  const passedDate = params.date as string | undefined;

  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const totalSeats = bus?.totalSeats ?? 32;

  const seats: Seat[] = Array.from({ length: totalSeats }, (_, i) => ({
    id: i + 1,
    label: rows[Math.floor(i / 4)] + ((i % 4) + 1),
  }));

  // Fetch bus info and booked seats
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const busRef = doc(db, 'buses', busId);
        const snap = await getDoc(busRef);

        if (snap.exists()) {
          const busData = snap.data();
          setBus(busData);

          const booked = Array.isArray(busData.bookedSeats)
            ? busData.bookedSeats
            : [];

          const bookedSeatIds = seats
            .filter((s) => booked.includes(s.label))
            .map((s) => s.id);

          setBookedSeats(bookedSeatIds);
        } else {
          console.error('Bus not found');
        }
      } catch (err) {
        console.error('Error fetching bus:', err);
      } finally {
        setLoading(false);
      }
    };

    if (busId) fetchBus();
  }, [busId]);

  // Listen to locked seats and clean expired ones
  useEffect(() => {
    if (!busId) return;

    const lockedSeatsRef = collection(db, 'buses', busId, 'lockedSeats');

    const cleanupExpiredSeats = async () => {
      const snapshot = await getDocs(lockedSeatsRef);
      const now = Date.now();

      for (const docSnap of snapshot.docs) {
        const timestamp = docSnap.data()?.timestamp;
        let lockedTime = 0;

        if (timestamp) {
          if (timestamp.toDate) lockedTime = timestamp.toDate().getTime();
          else if (timestamp instanceof Date) lockedTime = timestamp.getTime();
          else lockedTime = new Date(timestamp).getTime();
        }

        if (now - lockedTime >= 60 * 1000) {
          await deleteDoc(docSnap.ref);
        }
      }
    };

    const unsubscribe = onSnapshot(lockedSeatsRef, (snapshot) => {
      cleanupExpiredSeats();
      const locked = snapshot.docs.map((doc) => doc.id);
      setLockedSeats(locked);
    });

    return () => unsubscribe();
  }, [busId]);

  const lockSeat = async (seatLabel: string) => {
    if (!busId) return false;

    const seatLockRef = doc(db, 'buses', busId, 'lockedSeats', seatLabel);

    try {
      await runTransaction(db, async (transaction) => {
        const lockDoc = await transaction.get(seatLockRef);
        if (lockDoc.exists()) throw new Error('Seat already locked');
        transaction.set(seatLockRef, {
          timestamp: serverTimestamp(),
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const unlockSeat = async (seatLabel: string) => {
    if (!busId) return;
    const seatLockRef = doc(db, 'buses', busId, 'lockedSeats', seatLabel);
    try {
      await deleteDoc(seatLockRef);
    } catch (err) {
      console.error('Error unlocking seat:', err);
    }
  };

  const unlockAllSelectedSeats = async () => {
    for (const seatId of selectedSeats) {
      const seatLabel = seats.find((s) => s.id === seatId)?.label;
      if (seatLabel) await unlockSeat(seatLabel);
    }
  };

  const handleSeatPress = async (seatId: number) => {
    const seatLabel = seats.find((s) => s.id === seatId)?.label;
    if (!seatLabel) return;

    if (selectedSeats.includes(seatId)) {
      await unlockSeat(seatLabel);
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length < 4) {
        const locked = await lockSeat(seatLabel);
        if (locked) setSelectedSeats([...selectedSeats, seatId]);
        else alert(`Seat ${seatLabel} is already locked or booked.`);
      } else {
        alert('You can select up to 4 seats only.');
      }
    }
  };

  const handleConfirm = async () => {
    if (selectedSeats.length === 0) return;

    const seatLabels = selectedSeats
      .map((id) => seats.find((s) => s.id === id)?.label)
      .filter(Boolean);

    await unlockAllSelectedSeats();
    setSelectedSeats([]);

    router.push({
      pathname: '/ticket/confirm',
      params: {
        from: bus?.from || '',
        to: bus?.to || '',
        date: passedDate || bus?.date?.toDate?.().toISOString() || '',
        time: bus?.departureTime || '',
        seatLabels: JSON.stringify(seatLabels),
        price: (bus?.price || '').toString(),
        busId,
        busName: bus?.busName || '',
        acType: bus?.acType || 'Non AC',
      },
    });
  };

  const renderSeat = ({ item, index }: { item: Seat; index: number }) => {
    const isAisle = (index + 1) % 4 === 2;
    const isBooked = bookedSeats.includes(item.id);
    const isSelected = selectedSeats.includes(item.id);
    const isLocked = lockedSeats.includes(item.label);

    const seatSize = constrainedWidth(SCREEN_WIDTH * 0.11, 40, 60);
    const marginRight = isAisle ? SCREEN_WIDTH * 0.05 : 0;

    return (
      <View style={[styles.seatWrapper, { marginRight }]}>
        <TouchableOpacity
          style={[
            styles.seat,
            { width: seatSize, height: seatSize },
            isBooked
              ? styles.booked
              : isLocked
              ? styles.locked
              : isSelected
              ? styles.selectedSeat
              : styles.available,
          ]}
          disabled={isBooked || isLocked}
          onPress={() => handleSeatPress(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.seatText, { fontSize: seatSize * 0.4 }]}>{item.label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const startTime = bus?.departureTime || 'Unknown';
  const availableSeatsCount = (bus?.totalSeats ?? 0) - bookedSeats.length;
  const acLabel = bus?.acType === 'AC' ? 'AC' : 'Non-AC';

  // Min & Max width constraints
  const busCardWidth = constrainedWidth(SCREEN_WIDTH * 0.7, 300, 500);
  const busContainerWidth = constrainedWidth(SCREEN_WIDTH * 0.6, 300, 500);
  const confirmBtnWidth = constrainedWidth(SCREEN_WIDTH * 0.6, 300, 500);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eceefc', paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: SCREEN_HEIGHT * 0.05, paddingTop: SCREEN_HEIGHT * 0.02, alignItems: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bus Info Card */}
          <View style={[styles.card, { width: busCardWidth, paddingVertical: SCREEN_HEIGHT * 0.02 }]}>
            <View style={styles.cardTop}>
              <Text allowFontScaling={false} style={[styles.busName, { fontSize: SCREEN_WIDTH * 0.05 }]}>{bus?.busName || 'Bus'}</Text>
              <Text style={[styles.startTime, { fontSize: SCREEN_WIDTH * 0.045 }]}>{startTime}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={[styles.typeSeats, { fontSize: SCREEN_WIDTH * 0.035 }]}>
                Type: {acLabel} ({availableSeatsCount} available)
              </Text>
              <Text style={[styles.price, { fontSize: SCREEN_WIDTH * 0.045 }]}>
                <Text style={{ fontWeight: '700' }}>৳</Text> {bus?.price || '0'}
              </Text>
            </View>
          </View>

          {/* Seat Grid */}
          <View style={[styles.busContainer, { width: busContainerWidth, paddingVertical: SCREEN_HEIGHT * 0.02 }]}>
            <FlatList
              data={seats}
              renderItem={renderSeat}
              keyExtractor={(item) => item.id.toString()}
              numColumns={4}
              contentContainerStyle={styles.grid}
              scrollEnabled={false}
            />
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {[
              { color: '#16A34A', label: 'Available' },
              { color: '#3B82F6', label: 'Selected' },
              { color: '#e89d07', label: 'Locked' },
              { color: '#636060', label: 'Booked' },
            ].map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: item.color }]} />
                <Text>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Confirm Button */}
          {selectedSeats.length > 0 && (
            <View style={[styles.confirmButtonWrapper, { width: confirmBtnWidth, marginVertical: SCREEN_HEIGHT * 0.02 }]}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmButtonText, { fontSize: SCREEN_WIDTH * 0.045 }]}>
                  Confirm Seat{selectedSeats.length > 1 ? 's' : ''}{' '}
                  <Text style={styles.confirmSeatLabel}>
                    {selectedSeats.map((id) => seats.find((s) => s.id === id)?.label).join(', ')}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  busName: { fontWeight: '700', color: '#3a125d' },
  startTime: { fontWeight: '600', color: '#3a125d' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  typeSeats: { color: '#e89d07', fontWeight: '700' },
  price: { fontWeight: '700', color: '#000' },
  busContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#94a3b8',
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  grid: { alignItems: 'center' },
  seatWrapper: { margin: 6 },
  seat: { borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  available: { backgroundColor: '#16A34A' },
  selectedSeat: { backgroundColor: '#3B82F6' },
  locked: { backgroundColor: '#e89d07' },
  booked: { backgroundColor: '#636060' },
  seatText: { color: '#fff', fontWeight: '600' },
  confirmButtonWrapper: {},
  confirmButton: { backgroundColor: '#3a125d', paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: '600' },
  confirmSeatLabel: { color: '#facc15', fontWeight: '700' },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, gap: 22 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 18, height: 18, borderRadius: 4 },
});
