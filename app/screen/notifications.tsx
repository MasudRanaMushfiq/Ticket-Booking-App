import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: boolean;
  createdAt: any;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Simple query: fetch all notifications for this user
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid)
      );

      const snapshot = await getDocs(q);
      const data: Notification[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });

      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      Alert.alert('Error', 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  }, []);

  const handleNotificationPress = async (notif: Notification) => {
    if (!notif.status) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { status: true });
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, status: true } : n))
        );
      } catch (err) {
        console.error('Error updating notification:', err);
      }
    }
    Alert.alert(notif.title, notif.message); // Show full message
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notifications.length === 0 ? (
          <Text style={styles.noNotifText}>No notifications found.</Text>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.card, !notif.status && styles.unreadCard]}
              onPress={() => handleNotificationPress(notif)}
            >
              <View style={styles.row}>
                <Text style={[styles.title, !notif.status && { fontWeight: '700' }]}>
                  {notif.title}
                </Text>
                {!notif.status && <View style={styles.redDot} />}
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {notif.message}
              </Text>
              {notif.createdAt && (
                <Text style={styles.date}>{notif.createdAt.toDate().toLocaleString()}</Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#eceefc' },
  loadingIndicator: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', flex: 1 },

  container: { padding: 16, paddingBottom: 50 },
  noNotifText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#544d4d' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#e89d07', // Highlight unread
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  title: { fontSize: 16, color: '#3B7CF5' },
  message: { fontSize: 14, color: '#544d4d', marginBottom: 6 },
  date: { fontSize: 12, color: '#636060', textAlign: 'right' },
});
