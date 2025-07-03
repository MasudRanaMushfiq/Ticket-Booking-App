import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, Timestamp } from 'firebase/firestore';

interface UserData {
  fullName: string;
  email: string;
  createdAt: Timestamp;
}

interface Booking {
  id: string;
  from: string;
  to: string;
  seat: string;
  date: Timestamp;
  price: number;
  busId: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/signin');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data() as UserData);
        } else {
          setErrorMsg('User data not found.');
        }

        const bookingSnapshot = await getDocs(collection(userRef, 'bookings'));
        const userBookings: Booking[] = [];
        bookingSnapshot.forEach((doc) => {
          userBookings.push({ id: doc.id, ...doc.data() } as Booking);
        });

        setBookings(userBookings);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setErrorMsg('Failed to load profile or bookings.');
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace({ pathname: '/signin', params: { loggedOut: 'true' } });
    } catch {
      setErrorMsg('Failed to logout.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color="#10B981"
          style={{ flex: 1, justifyContent: 'center' }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <>
            <View style={styles.profileContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/profile/editProfile')}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/4.jpg' }}
                style={styles.profileImage}
              />
              <Text style={styles.name}>{userInfo?.fullName || 'Unnamed User'}</Text>
              <Text style={styles.info}>{userInfo?.email}</Text>
              <Text style={styles.info}>
                Joined:{' '}
                {userInfo?.createdAt
                  ? userInfo.createdAt.toDate().toISOString().slice(0, 10)
                  : 'Unknown'}
              </Text>
            </View>

            <View style={styles.ticketsContainer}>
              <Text style={styles.ticketsTitle}>Booked Tickets</Text>
              {bookings.map((item) => (
                <View key={item.id} style={styles.ticketRow}>
                  <View>
                    <Text style={styles.ticketRoute}>
                      {item.from} → {item.to}
                    </Text>
                    <Text style={styles.ticketInfo}>Seat: {item.seat}</Text>
                    <Text style={styles.ticketInfo}>
                      Date: {item.date?.toDate().toDateString()}
                    </Text>
                    <Text style={styles.ticketInfo}>Price: ৳ {item.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f0' },
  scrollContainer: { padding: 30, paddingBottom: 100 },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  editButtonText: { color: '#fff', fontWeight: '600', fontSize: 17 },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  name: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  info: { fontSize: 16, color: '#475569', marginBottom: 4 },
  ticketsContainer: { marginBottom: 20 },
  ticketsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 15,
  },
  ticketRow: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
  },
  ticketRoute: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  ticketInfo: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
  },
});
