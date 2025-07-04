import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface UserData {
  fullName: string;
  email: string;
  createdAt: Timestamp;
}

const ADMIN_UID = '9IXmZvX1ZyR1zgdcczjb6fiJxyx2';

export default function ProfileScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [currentUid, setCurrentUid] = React.useState<string | null>(null); // ✅ Track UID

  React.useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/signin');
        return;
      }

      setCurrentUid(user.uid); // ✅ Store current UID

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserInfo(userDoc.data() as UserData);
        } else {
          setErrorMsg('User data not found.');
        }
      } catch {
        setErrorMsg('Failed to load user data.');
      }
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace({ pathname: '/signin', params: { loggedOut: 'true' } });
    } catch {
      setErrorMsg('Failed to logout.');
    }
  };

  const handleEdit = () => {
    router.push('/profile/editProfile');
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
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <>
          {/* Profile Card Section */}
          <View style={styles.cardSection}>
            <View style={styles.profileSection}>
              <Ionicons
                name="person-circle"
                size={110}
                color="#10B981"
                style={styles.avatar}
              />
              <Text style={styles.name}>
                {userInfo?.fullName || 'Unnamed User'}
              </Text>
              <Text style={styles.email}>{userInfo?.email}</Text>
              <Text style={styles.joined}>
                Joined:{' '}
                {userInfo?.createdAt
                  ? userInfo.createdAt.toDate().toLocaleDateString()
                  : 'Unknown'}
              </Text>

              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Buttons Section */}
          <View style={styles.cardSection}>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.buttonRow}
                onPress={() => router.push('/ticket/ticketHistory')}
              >
                <MaterialIcons name="history" size={26} color="#4b5563" />
                <Text style={[styles.buttonText, { color: '#4b5563' }]}>
                  Ticket History
                </Text>
              </TouchableOpacity>

              {/* ✅ Admin Button - only for specific UID */}
              {currentUid === ADMIN_UID && (
                <TouchableOpacity
                  style={styles.buttonRow}
                  onPress={() => router.push('/admin')}
                >
                  <Ionicons name="settings-outline" size={26} color="#4b5563" />
                  <Text style={[styles.buttonText, { color: '#4b5563' }]}>
                    Admin Panel
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.buttonRow} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={26} color="#4b5563" />
                <Text style={[styles.buttonText, { color: '#4b5563' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#effbfb',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  cardSection: {
    padding: 15,
    marginBottom: 25,
  },
  profileSection: {
    borderWidth: 1,
    borderColor: '#6b6b6c',
    marginHorizontal: 5,
    marginVertical: 20,
    borderRadius: 10,
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingBottom: 40,
    paddingTop: 10,
  },
  avatar: {
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    marginLeft: 5,
  },
  email: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 2,
    marginLeft: 5,
  },
  joined: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 5,
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#5c5c5c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
  },
  buttonsContainer: {
    marginTop: 5,
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '600',
  },
});
