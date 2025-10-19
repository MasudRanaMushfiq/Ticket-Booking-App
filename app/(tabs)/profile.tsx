import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface UserData {
  fullName: string;
  email: string;
  createdAt: Timestamp;
  phone?: string;
  gender?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserAndRole = async () => {
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

        const adminRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminRef);
        if (adminDoc.exists() && adminDoc.data()?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setErrorMsg('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRole();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace({ pathname: '/signin', params: { loggedOut: 'true' } });
    } catch (err) {
      console.error('Error logging out:', err);
      setErrorMsg('Failed to logout.');
    }
  };

  const handleEdit = () => {
    router.push('/screen/editprofile');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#3a125d" style={styles.loadingIndicator} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#3a125d" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="notifications-outline" size={26} color="#3a125d" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <>
            {/* Compact Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.topRow}>
                <Ionicons name="person-circle" size={70} color="#3a125d" style={styles.avatarSmall} />
                <View style={styles.nameEmailContainer}>
                  <Text style={styles.nameCompact}>{userInfo?.fullName || 'Unnamed User'}</Text>
                  <Text style={styles.emailCompact}>{userInfo?.email}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color="#544d4d" />
                  <Text style={styles.infoText}>
                    Phone: {userInfo?.phone || 'Not set'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="transgender-outline" size={18} color="#544d4d" />
                  <Text style={styles.infoText}>
                    Gender:{' '}
                    {userInfo?.gender
                      ? userInfo.gender.charAt(0).toUpperCase() + userInfo.gender.slice(1)
                      : 'Not set'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#544d4d" />
                  <Text style={styles.infoText}>
                    Joined:{' '}
                    {userInfo?.createdAt
                      ? userInfo.createdAt.toDate().toLocaleDateString()
                      : 'Unknown'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/ticket/ticketHistory')}
              >
                <MaterialIcons name="history" size={26} color="#3a125d" />
                <Text style={styles.actionButtonText}>Ticket History</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('/admin')}
                >
                  <Ionicons name="settings-outline" size={26} color="#3a125d" />
                  <Text style={styles.actionButtonText}>Admin Panel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // navigate to contact us or support
                }}
              >
                <Ionicons name="call-outline" size={26} color="#3a125d" />
                <Text style={styles.actionButtonText}>Contact Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={26} color="#b91c1c" />
                <Text style={[styles.actionButtonText, { color: '#b91c1c' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a125d',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationIcon: {
    backgroundColor: '#eceefc',
    padding: 5,
    borderRadius: 20,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '600',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarSmall: {
    marginRight: 15,
  },
  nameEmailContainer: {
    flex: 1,
  },
  nameCompact: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3a125d',
    marginBottom: 3,
  },
  emailCompact: {
    fontSize: 14,
    color: '#544d4d',
  },
  infoSection: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  infoText: {
    fontSize: 15,
    color: '#544d4d',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#e89d07',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#e89d07',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 15,
    color: '#3a125d',
  },
});
