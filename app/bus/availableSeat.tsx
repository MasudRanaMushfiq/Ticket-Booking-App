import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
import { getAuth } from 'firebase/auth';
import { db } from '../../firebaseConfig';

interface Seat {
  id: number;
  label: string;
}

export default function AvailableSeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const busId = params.busId as string;
  const passedDate = params.date as string | undefined;

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

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

  // Listen to locked seats realtime updates
  useEffect(() => {
    if (!busId) return;

    const lockedSeatsRef = collection(db, 'buses', busId, 'lockedSeats');
    const unsubscribe = onSnapshot(lockedSeatsRef, (snapshot) => {
      const locked = snapshot.docs.map(doc => doc.id);
      setLockedSeats(locked);
    });

    return () => unsubscribe();
  }, [busId]);

  // Cleanup function to free all locked seats after 2 minutes
  useEffect(() => {
    if (!busId) return;

    const timeout = setTimeout(async () => {
      const lockedSeatsRef = collection(db, 'buses', busId, 'lockedSeats');
      const snapshot = await getDocs(lockedSeatsRef);

      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
      }
    }, 500); // 1 minutes in milliseconds

    return () => clearTimeout(timeout);
  }, [busId]);

  // Lock a seat in Firestore
  const lockSeat = async (seatLabel: string) => {
    if (!busId || !currentUserId) return false;

    const seatLockRef = doc(db, 'buses', busId, 'lockedSeats', seatLabel);

    try {
      await runTransaction(db, async (transaction) => {
        const lockDoc = await transaction.get(seatLockRef);
        if (lockDoc.exists()) throw new Error('Seat already locked');
        transaction.set(seatLockRef, {
          lockedBy: currentUserId,
          timestamp: serverTimestamp(),
        });
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Unlock a seat in Firestore
  const unlockSeat = async (seatLabel: string) => {
    if (!busId) return;

    const seatLockRef = doc(db, 'buses', busId, 'lockedSeats', seatLabel);
    try {
      await deleteDoc(seatLockRef);
    } catch (err) {
      console.error('Error unlocking seat:', err);
    }
  };

  // Unlock all selected seats (call on confirm or exit)
  const unlockAllSelectedSeats = async () => {
    for (const seatId of selectedSeats) {
      const seatLabel = seats.find(s => s.id === seatId)?.label;
      if (seatLabel) {
        await unlockSeat(seatLabel);
      }
    }
  };

  // Handle seat press: lock/unlock seat in Firestore accordingly
  const handleSeatPress = async (seatId: number) => {
    if (!currentUserId) {
      Alert.alert('Not Logged In', 'Please login to select seats.');
      return;
    }

    const seatLabel = seats.find(s => s.id === seatId)?.label;
    if (!seatLabel) return;

    if (selectedSeats.includes(seatId)) {
      await unlockSeat(seatLabel);
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length < 4) {
        const locked = await lockSeat(seatLabel);
        if (locked) {
          setSelectedSeats([...selectedSeats, seatId]);
        } else {
          Alert.alert(
            'Seat Locked',
            `Sorry, seat ${seatLabel} is already locked or booked.`,
          );
        }
      } else {
        Alert.alert('Limit reached', 'You can select up to 4 seats only.');
      }
    }
  };

  // Confirm booking: unlock all selected seats and navigate to confirm screen
  const handleConfirm = async () => {
    if (selectedSeats.length === 0) return;

    const seatLabels = selectedSeats
      .map((id) => seats.find((s) => s.id === id)?.label)
      .filter(Boolean);

    // Unlock seats now (or after booking confirmation in next screen)
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

    return (
      <View style={[styles.seatWrapper, isAisle && { marginRight: 30 }]}>
        <TouchableOpacity
          style={[
            styles.seat,
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
          <Text style={styles.seatText}>{item.label}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const startTime = bus?.departureTime || 'Unknown';
  const availableSeatsCount = (bus?.totalSeats ?? 0) - bookedSeats.length;
  const acLabel = bus?.acType === 'AC' ? 'AC' : 'Non-AC';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.busName}>{bus?.busName || 'Bus'}</Text>
            <Text style={styles.startTime}>{startTime}</Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.typeSeats}>
              Type: {acLabel} ({availableSeatsCount} available)
            </Text>
            <Text style={styles.price}>
              <Text style={{ fontWeight: '700' }}>৳</Text> {bus?.price || '0'}
            </Text>
          </View>
        </View>

        {/* Seat Grid */}
        <View style={styles.busContainer}>
          <View style={styles.busBody}>
            <FlatList
              data={seats}
              renderItem={renderSeat}
              keyExtractor={(item) => item.id.toString()}
              numColumns={4}
              contentContainerStyle={styles.grid}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Color Suggestion Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#16A34A' }]} />
            <Text>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#3B82F6' }]} />
            <Text>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#9f9f9fff' }]} />
            <Text>Booked</Text>
          </View>
        </View>

        {/* Confirm Button */}
        {selectedSeats.length > 0 && (
          <View style={styles.confirmButtonWrapper}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                Confirm Seat{selectedSeats.length > 1 ? 's' : ''}{' '}
                <Text style={styles.confirmSeatLabel}>
                  {selectedSeats
                    .map((id) => seats.find((s) => s.id === id)?.label)
                    .join(', ')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  busName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#06732eff',
  },
  startTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a125d',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeSeats: {
    fontSize: 14,
    color: '#e89d07',
    fontWeight: '700',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  busContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#94a3b8',
    minHeight: 150,
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  busBody: {
    paddingVertical: 30,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  grid: {
    alignItems: 'center',
  },
  seatWrapper: {
    margin: 6,
  },
  seat: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  available: {
    backgroundColor: '#16A34A',
  },
  selectedSeat: {
    backgroundColor: '#3B82F6',
  },
  locked: {
    backgroundColor: '#f59e0b', // orange
  },
  booked: {
    backgroundColor: '#9f9f9fff', // gray
  },
  seatText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  confirmButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderRadius: 30,
    overflow: 'hidden',
  },
  confirmButton: {
    backgroundColor: '#3a125d',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmSeatLabel: {
    color: '#facc15',
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 22,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
});
