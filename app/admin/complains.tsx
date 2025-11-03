import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { db, auth } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Complaint {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  title?: string;
  type?: string;
  description?: string;
  status?: string;
  createdAt: any;
  userId?: string; // UID of the user who created the complaint
}

export default function ComplaintsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{ [key: string]: string }>({});

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: Complaint[] = [];
      querySnapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Complaint);
      });
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      Alert.alert('Error', 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'complaints', id));
      Alert.alert('Deleted', 'Complaint removed successfully.');
      fetchComplaints();
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Failed to delete complaint.');
    }
  };

  const handleSendMessage = async (complaint: Complaint) => {
    const messageText = messages[complaint.id];
    if (!messageText || !messageText.trim()) {
      Alert.alert('Error', 'Please enter a message before sending.');
      return;
    }

    try {
      // Add notification to notifications collection with userId
      await addDoc(collection(db, 'notifications'), {
        userEmail: complaint.email,
        userId: complaint.userId, // ✅ track the UID of the user
        title: 'Response to your complaint',
        message: messageText,
        status: false, // unread
        createdAt: serverTimestamp(),
      });

      // Update complaint status to solved
      const complaintRef = doc(db, 'complaints', complaint.id);
      await updateDoc(complaintRef, { status: 'solved' });

      Alert.alert('Success', 'Message sent and complaint marked as solved!');
      setMessages({ ...messages, [complaint.id]: '' }); // clear input
      fetchComplaints(); // refresh complaints list
    } catch (err) {
      console.error('Send message error:', err);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#3B7CF5" style={styles.loadingIndicator} />
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
        <Text style={styles.headerTitle}>Complaints</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {complaints.length === 0 ? (
          <Text style={styles.noComplaintsText}>No complaints found.</Text>
        ) : (
          complaints.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{item.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{item.email}</Text>
              </View>
              {item.phone && (
                <View style={styles.row}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{item.phone}</Text>
                </View>
              )}
              {item.gender && (
                <View style={styles.row}>
                  <Text style={styles.label}>Gender:</Text>
                  <Text style={styles.value}>{item.gender}</Text>
                </View>
              )}
              {item.title && (
                <View style={styles.row}>
                  <Text style={styles.label}>Title:</Text>
                  <Text style={styles.value}>{item.title}</Text>
                </View>
              )}
              {item.type && (
                <View style={styles.row}>
                  <Text style={styles.label}>Type:</Text>
                  <Text style={styles.value}>{item.type}</Text>
                </View>
              )}
              {item.description && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.message}>{item.description}</Text>
                </View>
              )}
              {item.status && (
                <View style={styles.row}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{item.status}</Text>
                </View>
              )}
              {item.createdAt && (
                <Text style={styles.date}>{item.createdAt.toDate().toLocaleString()}</Text>
              )}

              {/* Show input & send only if complaint not solved */}
              {item.status !== 'solved' && (
                <>
                  <TextInput
                    placeholder="Type your response..."
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={messages[item.id] || ''}
                    onChangeText={(text) =>
                      setMessages({ ...messages, [item.id]: text })
                    }
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleSendMessage(item)}
                  >
                    <Text style={styles.sendButtonText}>Send Message</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Always show Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F2FF' },
  loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    marginTop: -20,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },

  container: { padding: 16, paddingBottom: 40 },
  noComplaintsText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#544d4d' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#3B7CF5', width: 80 },
  value: { fontSize: 15, color: '#544d4d', flex: 1 },
  message: { fontSize: 15, color: '#333', marginBottom: 8 },
  date: { fontSize: 12, color: '#636060', textAlign: 'right', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    color: '#333',
    fontSize: 14,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#3B7CF5',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  deleteButton: {
    backgroundColor: '#b91c1c',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
