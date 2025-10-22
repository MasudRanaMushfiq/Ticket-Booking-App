import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AvailableBusScreen() {
  const { from, to, date } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

    const rawDate = item.date?.toDate?.();
    const displayDate = rawDate
      ? rawDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Unknown Date';

    const startTime = item.departureTime;
    const endHour = parseInt(startTime?.split(':')[0] || '0', 10) + 4;
    const endTime = `${endHour < 10 ? '0' : ''}${endHour}:${startTime?.split(':')[1] || '00'}`;

    const acLabel = item.acType === 'AC' ? 'AC' : 'Non AC';

    return (
      <View style={[styles.busCard, { width: SCREEN_WIDTH * 0.9 }]}>
        <View style={styles.topSection}>
          <Image source={require('../../assets/images/bus1.png')} style={styles.busLogo} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.busName}>{item.busName}</Text>
            <Text style={styles.subInfo}>
              {acLabel} • {item.totalSeats} Seats
            </Text>
            <Text style={styles.dateText}>{displayDate}</Text>
          </View>
          <Text style={styles.price}>৳ {item.price}</Text>
        </View>

        <View style={styles.middleSection}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.location}>{from}</Text>
            <Text style={styles.time}>{startTime}</Text>
          </View>
          <View style={styles.dotsContainer}>
            {[...Array(7)].map((_, i) => (
              <View key={`dot1-${i}`} style={styles.dot} />
            ))}
            <FontAwesome name="bus" size={20} color="#3B7CF5" style={{ marginHorizontal: 8 }} />
            {[...Array(7)].map((_, i) => (
              <View key={`dot2-${i}`} style={styles.dot} />
            ))}
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.location}>{to}</Text>
            <Text style={styles.time}>{endTime}</Text>
          </View>
        </View>

        <View style={styles.tear} />

        <View style={styles.bottomSection}>
          <Text style={styles.review}>★★★ 4.5</Text>
          <Text style={styles.policy}>View Policy</Text>
          {isAvailable ? (
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() =>
                router.push({
                  pathname: '/bus/availableseat',
                  params: {
                    bus: JSON.stringify(item),
                    busId: item.id,
                    date: item.date?.toDate?.().toISOString() || '',
                    time: item.departureTime || '',
                    acType: item.acType || 'Non AC',
                  },
                })
              }
            >
              <Text style={styles.bookBtnText}>Book Seat</Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.bookBtn,
                { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DC2626' },
              ]}
            >
              <Text style={[styles.bookBtnText, { color: '#DC2626' }]}>Full</Text>
            </View>
          )}
        </View>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3B7CF5" />

      {/* ================== Header ================== */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Buses</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {sameDayBuses.length > 0 ? (
          <FlatList
            data={sameDayBuses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
          />
        ) : (
          <Text style={styles.noBus}>No buses found for this date</Text>
        )}

        {futureBuses.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Upcoming Buses</Text>
            <FlatList
              data={futureBuses}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc',
  },
  container: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B7CF5',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  noBus: {
    fontSize: 16,
    textAlign: 'center',
    color: '#636060',
    marginTop: 20,
  },
  busCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  busLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  busName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B7CF5',
  },
  subInfo: {
    fontSize: 13,
    color: '#544d4d',
    marginTop: 2,
  },
  dateText: {
    fontSize: 15,
    color: '#e89d07',
    marginTop: 4,
  },
  price: {
    color: 'green',
    fontWeight: '700',
    fontSize: 22,
    marginRight: 20,
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  location: {
    fontWeight: '600',
    color: '#3B7CF5',
  },
  time: {
    color: '#544d4d',
    fontSize: 13,
    marginTop: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B7CF5',
    marginHorizontal: 2,
  },
  tear: {
    height: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginVertical: 12,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  review: {
    fontSize: 15,
    color: '#e89d07',
  },
  policy: {
    fontSize: 13,
    color: '#544d4d',
  },
  bookBtn: {
    backgroundColor: '#e89d07',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  // ================== Header Styles ==================
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
});
