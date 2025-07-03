import React, { useState, useRef } from 'react'; import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, KeyboardAvoidingView, FlatList, Keyboard, Dimensions } from 'react-native'; import DateTimePicker from '@react-native-community/datetimepicker'; import { useRouter, useLocalSearchParams } from 'expo-router';

const divisions = [ 'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh', ];

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);

  const screenHeight = Dimensions.get('window').height;

  

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSearch = () => {
    if (from === to) {
      alert("'From' and 'To' cannot be the same.");
      return;
    }
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    router.push({
      pathname: '/bus/availableBus',
      params: {
        from,
        to,
        date: normalizedDate.toISOString(),
      },
    });
  };

  const handleFromChange = (text) => {
    setFrom(text);
    const filtered = divisions.filter((item) => item.toLowerCase().startsWith(text.toLowerCase()) && item !== to);
    setFromSuggestions(text ? filtered : divisions.filter((d) => d !== to));
  };

  const handleToChange = (text) => {
    setTo(text);
    const filtered = divisions.filter((item) => item.toLowerCase().startsWith(text.toLowerCase()) && item !== from);
    setToSuggestions(text ? filtered : divisions.filter((d) => d !== from));
  };

  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  return (
    <Wrapper style={styles.container} behavior="padding">
      {showSuccessMsg && (
        <Text style={styles.successMessage}>You have successfully logged in.</Text>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.buttonHalf, styles.addBusButton]} onPress={() => router.push('/bus/addBus')}>
          <Text style={styles.buttonText}>➕ Add Bus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonHalf, styles.viewAllButton]} onPress={() => router.push('/bus/allBus')}>
          <Text style={styles.buttonText}>View All Buses</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topSection}>
        <Text style={styles.title}>Search</Text>

        <View style={{ zIndex: 2 }}>
          <TextInput
            style={styles.input}
            placeholder="From"
            value={from}
            onChangeText={handleFromChange}
            onFocus={() => setActiveInput('from')}
          />
          {activeInput === 'from' && fromSuggestions.length > 0 && (
            <FlatList
              data={fromSuggestions}
              keyExtractor={(item) => item}
              style={styles.suggestionBox}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setFrom(item); setFromSuggestions([]); Keyboard.dismiss(); }}>
                  <Text style={styles.suggestionItem}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={{ zIndex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="To"
            value={to}
            onChangeText={handleToChange}
            onFocus={() => setActiveInput('to')}
          />
          {activeInput === 'to' && toSuggestions.length > 0 && (
            <FlatList
              data={toSuggestions}
              keyExtractor={(item) => item}
              style={styles.suggestionBox}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setTo(item); setToSuggestions([]); Keyboard.dismiss(); }}>
                  <Text style={styles.suggestionItem}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: '#475569' }}>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageSection}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854894.png' }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 24, paddingTop: 50 },
  successMessage: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  buttonHalf: { flex: 0.48, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addBusButton: { backgroundColor: '#3B82F6' },
  viewAllButton: { backgroundColor: '#16A34A' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  topSection: { zIndex: 0 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
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
  dateInput: { paddingVertical: 12 },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
  },
  suggestionBox: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 99,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageSection: { justifyContent: 'center', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  image: { width: '80%', height: 180 },
});
