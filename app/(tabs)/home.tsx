import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';

const divisions = [
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    if (params.loggedIn === 'true') {
      setShowSuccessMsg(true);
      const timer = setTimeout(() => {
        setShowSuccessMsg(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [params.loggedIn]);

  const onChangeDate = (event: any, selectedDate: Date | undefined) => {
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

  const handleFromChange = (text: string) => {
    setFrom(text);
    const filtered = divisions.filter(
      (item) =>
        item.toLowerCase().startsWith(text.toLowerCase()) && item !== to
    );
    setFromSuggestions(text ? filtered : divisions.filter((d) => d !== to));
  };

  const handleToChange = (text: string) => {
    setTo(text);
    const filtered = divisions.filter(
      (item) =>
        item.toLowerCase().startsWith(text.toLowerCase()) && item !== from
    );
    setToSuggestions(text ? filtered : divisions.filter((d) => d !== from));
  };

  const swapFromTo = () => {
    setFrom(to);
    setTo(from);
    setFromSuggestions([]);
    setToSuggestions([]);
    Keyboard.dismiss();
  };

  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  return (
    <Wrapper style={styles.container} behavior="padding">
      <View style={styles.messageContainer}>
        <Text style={[styles.successMessage, { opacity: showSuccessMsg ? 1 : 0 }]}>
          ✅ You have successfully logged in.
        </Text>
      </View>

      <View style={styles.topSection}>
        <Text style={styles.title}>Search</Text>

        {/* From input */}
        <View style={{ zIndex: 4 }}>
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
                <TouchableOpacity
                  onPress={() => {
                    setFrom(item);
                    setFromSuggestions([]);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.suggestionItem}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Swap icon centered in full row */}
        <View style={styles.swapRow}>
          <TouchableOpacity onPress={swapFromTo} activeOpacity={0.7}>
            <Text style={styles.swapIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* To input */}
        <View style={{ zIndex: 2 }}>
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
                <TouchableOpacity
                  onPress={() => {
                    setTo(item);
                    setToSuggestions([]);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.suggestionItem}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
        >
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
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/854/854894.png',
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  messageContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 14,
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  topSection: {
    zIndex: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  input: {
    height: 48,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  dateInput: {
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  imageSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  image: {
    width: '80%',
    height: 150,
  },
  swapRow: {
    marginBottom: 5,
    alignItems: 'center',
    width: '100%',
  },
  swapIcon: {
    fontSize: 32,
    color: '#2563eb',
  },
});
