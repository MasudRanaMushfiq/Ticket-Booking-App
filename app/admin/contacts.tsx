import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, Timestamp, getDoc, doc } from 'firebase/firestore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';

export default function ComplaintScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Service');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Current user info
  const [userData, setUserData] = useState<{ name: string; email: string; phone: string }>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        let phone = '';
        try {
          // Try fetching phone from Firestore if available
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            phone = userDoc.data().phone || '';
          }
        } catch (err) {
          console.warn('Could not fetch user phone:', err);
        }

        setUserData({
          name: currentUser.displayName || 'Unknown User',
          email: currentUser.email || '',
          phone: phone || currentUser.phoneNumber || '',
        });
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmitComplaint = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        userId: auth.currentUser?.uid || '',
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        title,
        type,
        description,
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      Alert.alert('Success', 'Your complaint has been submitted!');
      setTitle('');
      setDescription('');
      setType('Service');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit your complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#3B7CF5" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit a Complaint</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          {/* Auto user info */}
          <View style={styles.userInfoBox}>
            <Text style={styles.userInfoText}>Name: {userData.name}</Text>
            <Text style={styles.userInfoText}>Email: {userData.email}</Text>
            {userData.phone ? (
              <Text style={styles.userInfoText}>Phone: {userData.phone}</Text>
            ) : null}
          </View>

          {/* Complaint Title */}
          <Text style={styles.label}>Complaint Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter complaint title"
            placeholderTextColor="#999"
            style={styles.input}
          />

          {/* Complaint Type */}
          <Text style={styles.label}>Complaint Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={type}
              onValueChange={(value) => setType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Service" value="Service" />
              <Picker.Item label="Payment" value="Payment" />
              <Picker.Item label="Technical" value="Technical" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your issue..."
            placeholderTextColor="#999"
            multiline
            style={[styles.input, { height: 120 }]}
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmitComplaint}
            style={[styles.sendButton, { backgroundColor: '#3B7CF5' }]}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F2FF' },
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  container: { padding: 16, alignItems: 'center', paddingBottom: 40 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    width: '95%',
    marginTop: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfoBox: {
    backgroundColor: '#E6F2FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  userInfoText: {
    fontSize: 14,
    color: '#3a125d',
    marginBottom: 2,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3a125d',
    marginTop: 12,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#333',
    fontSize: 14,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 45,
  },
  sendButton: {
    borderRadius: 24,
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
