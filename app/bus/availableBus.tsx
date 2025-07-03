import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '@/firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export default function AvailableBusScreen() {
  const { from, to, date } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [sameDayBuses, setSameDayBuses] = useState<any[]>([]);
  const [futureBuses, setFutureBuses] = useState<any[]>([]);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const selectedDate = new Date(date as string);
        selectedDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(selectedDate.getTime() + 86400000);

        const sameDayQuery = query(
          collection(db, 'buses'),
          where('from', '==', from),
          where('to', '==', to),
          where('date', '>=', Timestamp.fromDate(selectedDate)),
          where('date', '<', Timestamp.fromDate(nextDay))
        );

        const futureQuery = query(
          collection(db, 'buses'),
          where('from', '==', from),
          where('to', '==', to),
          where('date', '>=', Timestamp.fromDate(nextDay))
        );

        const [sameDaySnap, futureSnap] = await Promise.all([
          getDocs(sameDayQuery),
          getDocs(futureQuery),
        ]);

        const sameDayResults: any[] = [];
        sameDaySnap.forEach((doc) => {
          sameDayResults.push({ id: doc.id, ...doc.data() });
        });

        const futureResults: any[] = [];
        futureSnap.forEach((doc) => {
          futureResults.push({ id: doc.id, ...doc.data() });
        });

        sameDayResults.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        futureResults.sort(
          (a, b) => a.date.seconds - b.date.seconds || a.departureTime.localeCompare(b.departureTime)
        );

        setSameDayBuses(sameDayResults);
        setFutureBuses(futureResults);
      } catch (err) {
        console.error('Error fetching buses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [from, to, date]);

  const renderItem = ({ item }: { item: any }) => {
    // Handle bookedSeats either as number or array
    const bookedCount =
      typeof item.bookedSeats === 'number'
        ? item.bookedSeats
        : Array.isArray(item.bookedSeats)
        ? item.bookedSeats.length
        : 0;

    const isAvailable = item.totalSeats > bookedCount;
    const availableSeats = item.totalSeats - bookedCount;

    return (
      <View style={styles.busRow}>
        <View>
          <Text style={styles.busName}>{item.busName}</Text>
          <Text style={styles.departure}>Departure: {item.departureTime}</Text>
          <Text style={styles.departure}>Price: ৳{item.price}</Text>
        </View>

        {isAvailable ? (
          <TouchableOpacity
            style={styles.availableButton}
            onPress={() =>
              router.push({
  pathname: '/bus/availableSeat',
  params: { 
    bus: JSON.stringify(item),
    busId: item.id,
    date: date as string,  // pass date string from current page params
  },
})
            }
          >
            <Text style={styles.availableButtonText}>{availableSeats} seats</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.seats, { color: '#DC2626' }]}>Full</Text>
        )}
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {from} → {to} on {new Date(date as string).toDateString()}
      </Text>

      {sameDayBuses.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Available Buses for Selected Date</Text>
          <FlatList
            data={sameDayBuses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </>
      ) : (
        <Text style={styles.noBus}>No buses found for this date</Text>
      )}

      {futureBuses.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Buses After This Date</Text>
          <FlatList
            data={futureBuses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 20,
  },
  noBus: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginTop: 50,
  },
  busRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
  },
  busName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  departure: {
    fontSize: 14,
    color: '#64748b',
  },
  seats: {
    fontSize: 16,
    fontWeight: '700',
  },
  availableButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  availableButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
