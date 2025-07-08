import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function AllBusScreen() {
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

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.busCard}>
        <View>
          <Text style={styles.busName}>{item.busName}</Text>
          <Text style={styles.info}>From: {item.from} → {item.to}</Text>
          <Text style={styles.info}>Departure: {item.departureTime}</Text>
          <Text style={styles.info}>Date: {item.date.toDate().toDateString()}</Text>
          <Text style={styles.info}>Price: ৳{item.price}</Text>
          <Text style={styles.info}>Seats: {item.totalSeats} total</Text>

          {/* Booked & Delete Inline */}
          <View style={styles.rowBetween}>
            <Text style={styles.booked}>Booked: {item.bookedSeats}</Text>
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
        </View>
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
    <View style={styles.container}>
      {successMsg ? <Text style={styles.successMsg}>{successMsg}</Text> : null}

      <Text style={styles.title}>All Buses</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc', // Background Color
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMsg: {
    backgroundColor: '#e89d07', // Secondary Color as background for success message
    color: '#3a125d', // Primary Color text for contrast
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 40,
    textAlign: 'center',
    color: '#3a125d', // Primary Color for title
  },
  noBus: {
    fontSize: 16,
    textAlign: 'center',
    color: '#636060', // Disable Color for less emphasis
    marginTop: 50,
  },
  busCard: {
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    // Optional subtle shadow for iOS & Android:
    shadowColor: '#3a125d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a125d', // Primary Color
  },
  info: {
    fontSize: 14,
    color: '#544d4d', // Text Color
    marginTop: 4,
  },
  booked: {
    fontSize: 14,
    color: '#544d4d', // Text Color
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  deleteButtonInline: {
    backgroundColor: '#e89d07', // Secondary Color
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: {
    color: '#3a125d', // Primary Color text on secondary background
    fontWeight: '900',
  },
});
