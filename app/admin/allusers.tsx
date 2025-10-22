import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

interface User {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  role?: string;
  createdAt?: any;
  bookingIds?: string[];
}

export default function AllUserScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const userList: User[] = userSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName || 'No Name',
          email: data.email || 'No Email',
          phone: data.phone || 'Not set',
          gender: data.gender || 'Not set',
          role: data.role || 'User',
          createdAt: data.createdAt || null,
          bookingIds: data.bookingIds || [],
        };
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    Alert.alert('Delete User', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', userId));
            setUsers((prev) => prev.filter((user) => user.id !== userId));
          } catch (error) {
            console.error('Error deleting user:', error);
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{item.fullName}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.email}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{item.phone}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>{item.gender}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{item.role}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.value}>
          {item.createdAt ? item.createdAt.toDate().toLocaleString() : 'Unknown'}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tickets Booked:</Text>
        <Text style={styles.value}>{item.bookingIds?.length || 0}</Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDeleteUser(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={22} color="#e89d07" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B7CF5" />
      </View>
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
        <Text style={styles.headerTitle}>All Users</Text>
        <View style={{ width: 32 }} />
      </View>

      {users.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: '#636060' }}>No users found.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc',
  },
  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },

  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#3a125d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { fontWeight: '600', fontSize: 14, color: '#3B7CF5', width: 140 },
  value: { fontSize: 14, color: '#544d4d', flex: 1 },

  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
