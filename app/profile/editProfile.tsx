import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          Alert.alert('Not logged in');
          router.replace('/signin');
          return;
        }
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.fullName || '');
          setEmail(data.email || '');
          setCreatedAt(data.createdAt?.toDate().toISOString().split('T')[0] || '');
        }
      } catch (err) {
        if (err instanceof Error) {
          Alert.alert('Error fetching user data', err.message);
        } else {
          Alert.alert('Error fetching user data', 'An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, user]);

  const handleUpdate = async () => {
    if (!name) {
      Alert.alert('Missing Field', 'Name is required.');
      return;
    }

    try {
      if (!user) {
        Alert.alert('Not logged in');
        router.replace('/signin');
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: name,
      });

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Update Failed', err.message);
      } else {
        Alert.alert('Update Failed', 'An unknown error occurred');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        editable={false}
        style={[styles.input, styles.readOnlyInput]}
      />

      <Text style={styles.label}>Created At</Text>
      <TextInput
        value={createdAt}
        editable={false}
        style={[styles.input, styles.readOnlyInput]}
      />

      <TouchableOpacity onPress={handleUpdate} style={styles.button}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#e5e7eb', // light gray to indicate disabled
    color: '#6b7280', // gray text
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



