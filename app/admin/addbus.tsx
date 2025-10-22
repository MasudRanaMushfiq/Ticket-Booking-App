import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddBusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [busName, setBusName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [price, setPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [acType, setAcType] = useState('Non_AC');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddBus = async () => {
    if (!busName || !from || !to || !departureTime || !price || !totalSeats || !acType) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const seatsNum = Number(totalSeats);
    if (seatsNum % 4 !== 0) {
      Alert.alert('Error', 'Total seats must be divisible by 4.');
      return;
    }

    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const busRef = doc(collection(db, 'buses'));

      await setDoc(busRef, {
        busId: busRef.id,
        busName: busName.trim(),
        from: from.trim(),
        to: to.trim(),
        date: Timestamp.fromDate(normalizedDate),
        departureTime: departureTime.trim(),
        price: Number(price),
        totalSeats: seatsNum,
        acType,
        bookedSeats: [],
      });

      Alert.alert('Success', 'Bus added successfully!');
      router.back();
    } catch (err) {
      console.error('Error adding bus:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Bus</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput
          placeholder="Bus Name"
          placeholderTextColor="#636060"
          value={busName}
          onChangeText={setBusName}
          style={styles.input}
        />
        <TextInput
          placeholder="From"
          placeholderTextColor="#636060"
          value={from}
          onChangeText={setFrom}
          style={styles.input}
        />
        <TextInput
          placeholder="To"
          placeholderTextColor="#636060"
          value={to}
          onChangeText={setTo}
          style={styles.input}
        />
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
            minimumDate={new Date()}
          />
        )}

        <TextInput
          placeholder="Departure Time (e.g. 09:00 PM)"
          placeholderTextColor="#636060"
          value={departureTime}
          onChangeText={setDepartureTime}
          style={styles.input}
        />
        <TextInput
          placeholder="Price (e.g. 720)"
          placeholderTextColor="#636060"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          placeholder="Total Seats (must be divisible by 4)"
          placeholderTextColor="#636060"
          value={totalSeats}
          onChangeText={setTotalSeats}
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={[styles.input, { paddingHorizontal: 0, justifyContent: 'center' }]}>
          <Picker
            selectedValue={acType}
            onValueChange={(itemValue) => setAcType(itemValue)}
            style={{ color: '#544d4d' }}
            dropdownIconColor="#3a125d"
          >
            <Picker.Item label="Non AC" value="Non_AC" />
            <Picker.Item label="AC" value="AC" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAddBus}>
          <Text style={styles.buttonText}>Add Bus</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eceefc' },
  header: {
    width: '100%',
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },

  formContainer: { padding: 24, paddingBottom: 50 },
  input: {
    height: 48,
    borderColor: '#3a125d',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#544d4d',
    justifyContent: 'center',
  },
  dateText: { color: '#544d4d' },
  button: {
    marginTop: 20,
    backgroundColor: '#3B7CF5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
