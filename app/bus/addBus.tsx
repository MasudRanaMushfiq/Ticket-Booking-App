import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useRouter } from 'expo-router';

export default function AddBusScreen() {
  const router = useRouter();

  const [busName, setBusName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [price, setPrice] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddBus = async () => {
    if (!busName || !from || !to || !departureTime || !price || !totalSeats) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Generate a new doc ref with auto ID (this is the busId)
      const busRef = doc(collection(db, 'buses'));

      await setDoc(busRef, {
        busId: busRef.id, // save the generated doc ID as busId
        busName: busName.trim(),
        from: from.trim(),
        to: to.trim(),
        date: Timestamp.fromDate(normalizedDate),
        departureTime: departureTime.trim(),
        price: Number(price),
        totalSeats: Number(totalSeats),
        bookedSeats: [], // empty array for booked seats initially
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
      <Text style={styles.heading}>Add New Bus</Text>

      <TextInput
        placeholder="Bus Name"
        value={busName}
        onChangeText={setBusName}
        style={styles.input}
      />
      <TextInput placeholder="From" value={from} onChangeText={setFrom} style={styles.input} />
      <TextInput placeholder="To" value={to} onChangeText={setTo} style={styles.input} />
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: '#475569' }}>{date.toDateString()}</Text>
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
        value={departureTime}
        onChangeText={setDepartureTime}
        style={styles.input}
      />
      <TextInput
        placeholder="Price (e.g. 720)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Total Seats (e.g. 30)"
        value={totalSeats}
        onChangeText={setTotalSeats}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddBus}>
        <Text style={styles.buttonText}>Add Bus</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
