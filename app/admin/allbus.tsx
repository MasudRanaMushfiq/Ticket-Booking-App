import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AllBusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'buses'));
      const busList: any[] = [];
      snapshot.forEach((doc) => {
        busList.push({ id: doc.id, ...doc.data() });
      });
      setBuses(busList);
    } catch (err) {
      console.error('Error fetching buses:', err);
      Alert.alert('Error', 'Failed to fetch buses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleDelete = async (busId: string) => {
    try {
      await deleteDoc(doc(db, 'buses', busId));
      setBuses((prev) => prev.filter((bus) => bus.id !== busId));
      setSuccessMsg('Bus deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error deleting bus:', err);
      Alert.alert('Error', 'Failed to delete bus.');
    }
  };

  const renderBookedSeats = (bookedSeats: any[]) => {
    if (!bookedSeats || bookedSeats.length === 0) return <Text style={styles.noBooked}>No bookings</Text>;

    return (
      <View style={styles.bookedContainer}>
        {bookedSeats.map((seat, index) => (
          <View key={index} style={styles.bookedChip}>
            <Text style={styles.bookedChipText}>{seat}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.busCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Bus Name:</Text>
          <Text style={styles.value}>{item.busName}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>From → To:</Text>
          <Text style={styles.value}>{item.from} → {item.to}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Departure:</Text>
          <Text style={styles.value}>{item.departureTime}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{item.date.toDate().toDateString()}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>৳{item.price}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Seats:</Text>
          <Text style={styles.value}>{item.totalSeats} total</Text>
          <TouchableOpacity
            style={styles.deleteButtonInline}
            onPress={() =>
              Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this bus?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => handleDelete(item.id), style: 'destructive' },
                ]
              )
            }
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Booked Seats:</Text>
        {renderBookedSeats(item.bookedSeats)}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#3B7CF5" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Buses</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.container}>
        {successMsg ? <Text style={styles.successMsg}>{successMsg}</Text> : null}

        {buses.length === 0 ? (
          <Text style={styles.noBus}>No buses found</Text>
        ) : (
          <FlatList
            data={buses}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eceefc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    marginTop: -10,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },

  container: { flex: 1, padding: 20 },
  successMsg: {
    backgroundColor: '#e89d07',
    color: '#3a125d',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  noBus: { fontSize: 16, textAlign: 'center', color: '#636060', marginTop: 50 },

  busCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#3a125d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },

  label: { fontSize: 14, fontWeight: '600', color: '#3B7CF5', width: 100 },
  value: { fontSize: 15, color: '#544d4d', flex: 1 },
  separator: { height: 1, backgroundColor: '#ddd', marginVertical: 6 },

  bookedContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  bookedChip: { backgroundColor: '#3B7CF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, margin: 4 },
  bookedChipText: { color: '#fff', fontWeight: '600' },
  noBooked: { fontSize: 14, color: '#636060', marginTop: 6 },

  deleteButtonInline: {
    backgroundColor: '#e89d07',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: { color: '#3a125d', fontWeight: '900' },
});
