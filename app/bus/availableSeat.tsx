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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

interface Seat {
  id: number;
  label: string;
}

export default function AvailableSeatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const busId = params.busId as string;
  const passedDate = params.date as string | undefined;

  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const TOTAL_SEATS = 32;
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const seats: Seat[] = Array.from({ length: TOTAL_SEATS }, (_, i) => ({
    id: i + 1,
    label: rows[Math.floor(i / 4)] + ((i % 4) + 1),
  }));

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

          // Convert seat labels (e.g. "A1") to seat numbers based on label mapping
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
  }, [busId, seats]);

  const handleConfirm = () => {
    if (selectedSeat !== null) {
      const seatLabel = seats.find((s) => s.id === selectedSeat)?.label ?? 'Unknown';

      router.push({
        pathname: '/bus/confirm',
        params: {
          from: bus?.from || '',
          to: bus?.to || '',
          date: passedDate || bus?.date || '',
          seatLabel,
          price: (bus?.price || '').toString(),
          busId,
        },
      });

      setSelectedSeat(null);
    }
  };

  const renderSeat = ({ item, index }: { item: Seat; index: number }) => {
    const isAisle = (index + 1) % 4 === 2;
    const isBooked = bookedSeats.includes(item.id);
    const isSelected = selectedSeat === item.id;

    return (
      <View style={[styles.seatWrapper, isAisle && { marginRight: 30 }]}>
        <TouchableOpacity
          style={[
            styles.seat,
            isBooked
              ? styles.booked
              : isSelected
              ? styles.selectedSeat
              : styles.available,
          ]}
          disabled={isBooked}
          onPress={() => setSelectedSeat(item.id)}
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>{bus?.busName || 'Bus'}</Text>
        <Text style={styles.subtitle}>
          Date: {passedDate ? new Date(passedDate).toDateString() : ''}
        </Text>
        <Text style={styles.subtitle}>
          Available Seats: {TOTAL_SEATS - bookedSeats.length} / {TOTAL_SEATS}
        </Text>

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

        <View style={styles.legend}>
          <Text style={styles.legendItem}>🟩 Available  🟢 Booked  🟦 Selected</Text>
        </View>

        {selectedSeat !== null && (
          <View style={styles.confirmButtonWrapper}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                Confirm Seat{' '}
                <Text style={styles.confirmSeatLabel}>
                  {seats.find((s) => s.id === selectedSeat)?.label}
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
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#16A34A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  busContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#94a3b8',
    marginBottom: 30,
    minHeight: 300,
    justifyContent: 'center',
  },
  busBody: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  grid: {
    alignItems: 'center',
  },
  seatWrapper: {
    margin: 6,
  },
  seat: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  available: {
    backgroundColor: '#16A34A',
  },
  booked: {
    backgroundColor: '#bbf7d0',
    borderWidth: 1,
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  selectedSeat: {
    backgroundColor: '#3B82F6',
  },
  seatText: {
    color: '#fff',
    fontWeight: '600',
  },
  legend: {
    alignItems: 'center',
  },
  legendItem: {
    fontSize: 14,
    color: '#334155',
  },
  confirmButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  confirmSeatLabel: {
    color: '#facc15',
    fontWeight: '900',
  },
});



