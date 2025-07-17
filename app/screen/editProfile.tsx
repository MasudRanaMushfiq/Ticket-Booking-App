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
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState(''); // 'male', 'female', 'other'

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
          setCreatedAt(data.createdAt?.toDate?.().toISOString().split('T')[0] || '');
          setPhone(data.phone || '');
          setGender(data.gender || '');
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
        phone,
        gender,
      });

      Alert.alert('Success', 'Profile updated successfully');
      router.replace('/(tabs)/profile');  // Navigate to profile page
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
        <ActivityIndicator size="large" color="#3a125d" />
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

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        placeholder="Enter phone number"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select gender" value="" />
          <Picker.Item label="Male" value="male" />
          <Picker.Item label="Female" value="female" />
          <Picker.Item label="Other" value="other" />
        </Picker>
      </View>

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
    backgroundColor: '#eceefc',
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#eceefc',
  },
  label: {
    fontSize: 16,
    color: '#544d4d',
    marginTop: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#636060',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#544d4d',
  },
  readOnlyInput: {
    backgroundColor: '#eceefc',
    color: '#636060',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#636060',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#3a125d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    elevation: 3,
  },
  buttonText: {
    color: '#eceefc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
