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
    const bookedCount =
      typeof item.bookedSeats === 'number'
        ? item.bookedSeats
        : Array.isArray(item.bookedSeats)
        ? item.bookedSeats.length
        : 0;

    const isAvailable = item.totalSeats > bookedCount;
    const availableSeats = item.totalSeats - bookedCount;

    const displayDate = item.date?.toDate?.().toDateString?.() ?? 'Unknown Date';

    return (
      <View style={styles.busRow}>
        <View style={styles.busInfo}>
          <Text style={styles.busName}>{item.busName}</Text>
          <Text style={styles.date}>Date: {displayDate}</Text>
          <Text style={styles.departure}>Departure: {item.departureTime}</Text>
          <Text style={styles.departure}>Price: ৳ {item.price}</Text>
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
                  date: date as string,
                },
              })
            }
          >
            <Text style={styles.availableButtonText}>{availableSeats} seats</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.seats, styles.fullSeats]}>Full</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3a125d" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>
        {from} → {to} on {new Date(date as string).toDateString()}
      </Text>

      {sameDayBuses.length > 0 ? (
        <View style={styles.firstSectionCard}>
          <Text style={styles.sectionTitle}>Available Buses for Selected Date</Text>
          <FlatList
            data={sameDayBuses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      ) : (
        <Text style={styles.noBus}>No buses found for this date</Text>
      )}

      {futureBuses.length > 0 && (
        <View style={styles.futureSection}>
          <Text style={styles.sectionTitle}>Upcoming Buses After This Date</Text>
          <FlatList
            data={futureBuses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc', // Background color from your palette
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 18,
    color: '#3a125d', // Primary color
    textAlign: 'center',
  },
  firstSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  futureSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#544d4d', // Text color
    marginBottom: 14,
  },
  noBus: {
    fontSize: 16,
    textAlign: 'center',
    color: '#636060', // Disabled color
    marginTop: 20,
    fontStyle: 'italic',
  },
  busRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e9e6fa', // very light shade of primary (#3a125d) for subtle highlight
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  busInfo: {
    flexShrink: 1,
  },
  busName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3a125d', // primary color for emphasis
    marginBottom: 4,
  },
  departure: {
    fontSize: 14,
    color: '#544d4d', // text color
  },
  date: {
    fontSize: 14,
    color: '#544d4d', // primary color
  },
  seats: {
    fontSize: 16,
    fontWeight: '700',
  },
  fullSeats: {
    color: '#DC2626', // red for full seats
  },
  availableButton: {
    backgroundColor: '#e89d07', // secondary color
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  availableButtonText: {
    color: '#eceefc', // background color for contrast
    fontWeight: '700',
    fontSize: 15,
  },
});
