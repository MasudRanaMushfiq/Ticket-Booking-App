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
import { doc, getDoc } from 'firebase/firestore';
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

  const [loading, setLoading] = useState(true);
  const [bus, setBus] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Rows for seat labels
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Use totalSeats dynamically, fallback to 32 if bus data not loaded yet
  const totalSeats = bus?.totalSeats ?? 32;

  // Generate seats based on totalSeats dynamically
  const seats: Seat[] = Array.from({ length: totalSeats }, (_, i) => ({
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

          // Convert booked seat labels to seat IDs (based on seats array)
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
  }, []);

  const handleSeatPress = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      // Select seat only if less than 4 already selected
      if (selectedSeats.length < 4) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        Alert.alert('Limit reached', 'You can select up to 4 seats only.');
      }
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length > 0) {
      const seatLabels = selectedSeats
        .map((id) => seats.find((s) => s.id === id)?.label)
        .filter(Boolean);

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
          acType: bus?.acType || 'Non AC', // ✅ Added AC/Non-AC info
        },
      });


      setSelectedSeats([]);
    }
  };

  const renderSeat = ({ item, index }: { item: Seat; index: number }) => {
    const isAisle = (index + 1) % 4 === 2;
    const isBooked = bookedSeats.includes(item.id);
    const isSelected = selectedSeats.includes(item.id);

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

  // Format start time display
  const startTime = bus?.departureTime || 'Unknown';

  // Calculate available seats count dynamically
  const availableSeatsCount = (bus?.totalSeats ?? 0) - bookedSeats.length;

  // Determine AC / Non-AC label (default Non-AC)
  const acLabel = bus?.acType === 'AC' ? 'AC' : 'Non-AC';

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        {/* Top card */}
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

        {/* Bus seats layout */}
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

        {/* Confirm button */}
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
    color: '#475569',
    fontWeight: '700',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0c893aff',
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
  seatText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  booked: {
    backgroundColor: '#9f9f9fff',
  },
  confirmButtonWrapper: {
    position: 'absolute',
    bottom: 100,
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
});
