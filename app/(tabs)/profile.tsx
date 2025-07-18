import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface UserData {
  fullName: string;
  email: string;
  createdAt: Timestamp;
  phone?: string;
  gender?: string;
}

const ADMIN_UID = 'CtKI7N2H7uYdmdUC62eOt89dmGY2'; // Define your admin UID here

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [currentUid, setCurrentUid] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/signin');
        return;
      }

      setCurrentUid(user.uid);

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data() as UserData);
        } else {
          setErrorMsg('User data not found.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setErrorMsg('Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes to re-fetch user data if needed
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUser();
      } else {
        setLoading(false);
        router.replace('/signin');
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [router]); // router is a stable object provided by expo-router, so it's safe here.

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
        <ActivityIndicator
          size="large"
          color="#3a125d"
          style={styles.loadingIndicator}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Profile Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => router.push('/(tabs)/home')} // Adjust this path if needed
        >
          <Ionicons name="notifications-outline" size={26} color="#3a125d" />
        </TouchableOpacity>
      </View>

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Details Card */}
          <View style={styles.profileCard}>
            <Ionicons
              name="person-circle"
              size={120} // Larger avatar
              color="#3a125d"
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {userInfo?.fullName || 'Unnamed User'}
            </Text>
            <Text style={styles.email}>{userInfo?.email}</Text>

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
                  ? userInfo.gender.charAt(0).toUpperCase() +
                    userInfo.gender.slice(1)
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

            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/ticket/ticketHistory')}
            >
              <MaterialIcons name="history" size={26} color="#3a125d" />
              <Text style={styles.actionButtonText}>Ticket History</Text>
            </TouchableOpacity>

            {currentUid === ADMIN_UID && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/admin')}
              >
                <Ionicons
                  name="settings-outline"
                  size={26}
                  color="#3a125d"
                />
                <Text style={styles.actionButtonText}>Admin Panel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Implement contact us functionality or navigate to a contact screen
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={26} color="#3a125d" />
              <Text style={styles.actionButtonText}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={26} color="#b91c1c" /> {/* Red for logout */}
              <Text style={[styles.actionButtonText, { color: '#b91c1c' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc', // Light background
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
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#3a125d', // Primary color for header
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#eceefc', // Light text for header
  },
  notificationIcon: {
    padding: 5,
    backgroundColor: '#eceefc', // Light background for icon button
    borderRadius: 20,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20, // Add some padding from the header
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
    borderRadius: 15,
    padding: 20,
    alignItems: 'center', // Center content horizontally
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  avatar: {
    marginBottom: 15,
  },
  name: {
    fontSize: 26,
    fontWeight: '800', // Bolder name
    color: '#3a125d',
    marginBottom: 5,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#544d4d',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%', // Take full width
    paddingHorizontal: 10, // Indent info slightly
  },
  infoText: {
    fontSize: 15,
    color: '#544d4d',
    marginLeft: 10, // Space between icon and text
  },
  joined: {
    fontSize: 13,
    color: '#636060',
    marginTop: 10,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#e89d07', // Secondary color
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#e89d07',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonsContainer: {
    // No specific container style needed, as each button is a card now
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
    color: '#3a125d', // Primary color for action text
  },
});