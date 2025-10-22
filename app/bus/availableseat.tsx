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
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
import { db, auth } from '../../firebaseConfig';

interface Seat {
  id: number;
  label: string;
}

const LOCK_TIME = 10 * 1000; // 10 minutes

export default function AvailableSeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const busId = params.busId as string;
  const passedDate = params.date as string | undefined;
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [lockingSeat, setLockingSeat] = useState(false); // 🔹 for overlay

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const totalSeats = bus?.totalSeats ?? 32;
  const seats: Seat[] = Array.from({ length: totalSeats }, (_, i) => ({
    id: i + 1,
    label: rows[Math.floor(i / 4)] + ((i % 4) + 1),
  }));

  // Fetch bus info
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const busRef = doc(db, 'buses', busId);
        const snap = await getDoc(busRef);
        if (snap.exists()) {
          const data = snap.data();
          setBus(data);
          const booked = Array.isArray(data.bookedSeats) ? data.bookedSeats : [];
          setBookedSeats(booked);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (busId) fetchBus();
  }, [busId]);

  // Handle locked seats
  useEffect(() => {
    if (!busId) return;
    const ref = collection(db, 'buses', busId, 'lockedSeats');

    const cleanupExpiredSeats = async () => {
      const snap = await getDocs(ref);
      const now = Date.now();
      for (const d of snap.docs) {
        const ts = d.data()?.timestamp;
        let lockedTime = 0;
        if (ts?.toDate) lockedTime = ts.toDate().getTime();
        else if (ts instanceof Date) lockedTime = ts.getTime();
        else if (ts) lockedTime = new Date(ts).getTime();
        if (now - lockedTime >= LOCK_TIME) await deleteDoc(d.ref);
      }
    };

    const refreshLocks = async () => {
      const snap = await getDocs(ref);
      const now = Date.now();
      const validLocks = snap.docs
        .filter((d) => {
          const ts = d.data()?.timestamp;
          let lockedTime = 0;
          if (ts?.toDate) lockedTime = ts.toDate().getTime();
          else if (ts instanceof Date) lockedTime = ts.getTime();
          else if (ts) lockedTime = new Date(ts).getTime();
          return now - lockedTime < LOCK_TIME;
        })
        .map((d) => d.id);
      setLockedSeats(validLocks);
    };

    (async () => {
      await cleanupExpiredSeats();
      await refreshLocks();
      setLoading(false);
    })();

    const unsub = onSnapshot(ref, (snap) => {
      const now = Date.now();
      const validLocks = snap.docs
        .filter((d) => {
          const ts = d.data()?.timestamp;
          let lockedTime = 0;
          if (ts?.toDate) lockedTime = ts.toDate().getTime();
          else if (ts instanceof Date) lockedTime = ts.getTime();
          else if (ts) lockedTime = new Date(ts).getTime();
          return now - lockedTime < LOCK_TIME;
        })
        .map((d) => d.id);
      setLockedSeats(validLocks);
    });

    return () => unsub();
  }, [busId]);

  const lockSeat = async (label: string) => {
    if (!busId) return false;
    const seatRef = doc(db, 'buses', busId, 'lockedSeats', label);
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(seatRef);
        if (snap.exists()) throw new Error('Seat already locked');
        tx.set(seatRef, { userId: auth.currentUser?.uid || '', timestamp: serverTimestamp() });
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleSeatPress = async (id: number) => {
    const label = seats.find((s) => s.id === id)?.label;
    if (!label) return;

    if (bookedSeats.includes(label)) {
      Alert.alert('Already Booked', `Seat ${label} is already booked.`);
      return;
    }

    if (lockedSeats.includes(label)) {
      Alert.alert('Seat Locked', `Seat ${label} is temporarily locked.`);
      return;
    }

    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== id));
    } else {
      if (selectedSeats.length >= 4) {
        Alert.alert('Limit Reached', 'You can select up to 4 seats only.');
        return;
      }

      // 🔹 Start locking overlay
      setLockingSeat(true);

      setTimeout(async () => {
        const success = await lockSeat(label);
        if (success) {
          setSelectedSeats([...selectedSeats, id]);
        } else {
          Alert.alert('Seat Locked', `Seat ${label} is already locked or booked.`);
        }
        // 🔹 End overlay after locking
        setLockingSeat(false);
      }, 2000); // 2-second delay
    }
  };

  const handleNext = () => {
    const seatLabels = selectedSeats
      .map((id) => seats.find((s) => s.id === id)?.label)
      .filter((s): s is string => !!s);

    router.push({
      pathname: '/ticket/confirm',
      params: {
        from: bus?.from || '',
        to: bus?.to || '',
        date: passedDate || bus?.date?.toDate?.()?.toISOString() || '',
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
    const isBooked = bookedSeats.includes(item.label);
    const isLocked = lockedSeats.includes(item.label);
    const isSelected = selectedSeats.includes(item.id);
    const marginRight = isAisle ? 20 : 0;

    return (
      <View style={[styles.seatWrapper, { marginRight }]}>
        <TouchableOpacity
          style={[
            styles.seat,
            isBooked
              ? styles.booked
              : isLocked
              ? styles.locked
              : isSelected
              ? styles.selected
              : styles.available,
          ]}
          disabled={isBooked || isLocked || lockingSeat} // 🔹 disable during overlay
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
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
    );
  }

  const availableSeatsCount = (bus?.totalSeats ?? 0) - bookedSeats.length;
  const startTime = bus?.departureTime || 'N/A';
  const acLabel = bus?.acType || 'Non-AC';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eceefc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#3B7CF5" />

      {/* ================== Header ================== */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Select Your Seat</Text>

        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: 'center',
            paddingBottom: 50,
            paddingTop: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.busName}>{bus?.busName || 'Bus'}</Text>
              <Text style={styles.startTime}>{startTime}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.typeSeats}>
                {acLabel} • {availableSeatsCount} available
              </Text>
              <Text style={styles.price}>৳ {bus?.price || 0}</Text>
            </View>
          </View>

          <View style={styles.busContainer}>
            <FlatList
              data={seats}
              renderItem={renderSeat}
              keyExtractor={(item) => item.id.toString()}
              numColumns={4}
              scrollEnabled={false}
              contentContainerStyle={styles.grid}
            />
          </View>

          <View style={styles.legendContainer}>
            {[
              { color: '#16A34A', label: 'Available' },
              { color: '#e89d07', label: 'Locked' },
              { color: '#636060', label: 'Booked' },
            ].map((i, idx) => (
              <View key={idx} style={styles.legendItem}>
                <View style={[styles.legendBox, { backgroundColor: i.color }]} />
                <Text style={styles.legendText}>{i.label}</Text>
              </View>
            ))}
          </View>

          {selectedSeats.length > 0 && (
            <TouchableOpacity style={styles.confirmButton} onPress={handleNext}>
              <Text style={styles.confirmText}>
                Proceed → {selectedSeats.map(id => seats.find(s => s.id === id)?.label).join(', ')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 🔹 Overlay during seat locking */}
      {lockingSeat && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Selecting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    width: 350,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  busName: { fontWeight: '700', color: '#3B7CF5', fontSize: 18 },
  startTime: { color: '#544d4d', fontWeight: '600', fontSize: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  typeSeats: { color: '#e89d07', fontWeight: '600', fontSize: 15 },
  price: { color: '#3B7CF5', fontWeight: '700', fontSize: 17 },
  busContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    width: 300,
    paddingVertical: 20,
  },
  grid: { alignItems: 'center' },
  seatWrapper: { margin: 6 },
  seat: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  available: { backgroundColor: '#16A34A' },
  selected: { backgroundColor: '#3B82F6' },
  locked: { backgroundColor: '#e89d07' },
  booked: { backgroundColor: '#636060' },
  seatText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 15,
    width: 320,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 20, height: 20, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 14 },
  confirmButton: {
    backgroundColor: '#3B7CF5',
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 25,
    alignItems: 'center',
    width: 300,
  },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: { color: '#fff', fontSize: 22, fontWeight: '700' },
});
