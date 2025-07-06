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
import { db } from '@/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: string;
  fullName: string;
  email: string;
  bookingIds: string[];
}

export default function AllUserScreen() {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3a125d" />
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#636060' }}>No users found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>All Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.bookingCount}>
                Booked Tickets: {item.bookingIds.length}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteUser(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={22} color="#e89d07" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc', // Background Color
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3a125d', // Primary Color
    textAlign: 'center',
    marginTop: 70,
    marginBottom: 15,
  },
  list: {
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#3a125d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a125d', // Primary Color
  },
  email: {
    fontSize: 15,
    color: '#544d4d', // Text Color
    marginTop: 4,
  },
  bookingCount: {
    marginTop: 6,
    fontSize: 14,
    color: '#636060', // Disable Color
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
