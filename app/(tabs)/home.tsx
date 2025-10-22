import SwapIcon from '@/assets/images/SwapIcon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

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

const tourImages = [
  {
    image:
      'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'Luxury AC Bus Tour',
    desc: 'Experience comfort and style on our premium AC buses across Bangladesh.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    title: 'City Sightseeing',
    desc: 'Hop on for a city tour and explore the best spots with guided bus tours.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=400&q=80',
    title: 'Intercity Express',
    desc: 'Fast and safe intercity bus journeys connecting all major divisions.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Family Tour Bus',
    desc: 'Spacious and family-friendly buses for your next group adventure.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: 'Night Coach',
    desc: 'Travel overnight in comfort with our safe and reliable night coaches.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);

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
      pathname: '/bus/availablebus',
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

  const renderDropdown = (suggestions: string[], onSelect: (val: string) => void) => {
    return (
      <View style={styles.dropdownContainer}>
        {suggestions.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => {
              onSelect(item);
              Keyboard.dismiss();
            }}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.bg}
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Image
            source={{ uri: 'https://img.icons8.com/color/96/000000/bus.png' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Find Your Bus Now</Text>
        </View>
        <Text style={styles.subtitle}>
          Plan Your Journey With Our Ease Solution
        </Text>

        {/* Inputs */}
        <View style={styles.topSection}>
          {/* From Input */}
          <View style={{ zIndex: 4, position: 'relative' }}>
            <TextInput
              style={styles.input}
              placeholder="From"
              placeholderTextColor="#8b8686"
              value={from}
              onChangeText={handleFromChange}
              onFocus={() => setActiveInput('from')}
              selectionColor="#3a125d"
            />
            <View style={styles.swapIconWrapperBetween}>
              <TouchableOpacity
                onPress={swapFromTo}
                activeOpacity={0.7}
                style={styles.swapCard}
              >
                <SwapIcon size={20} color="#e89d07" />
              </TouchableOpacity>
            </View>
            {activeInput === 'from' && fromSuggestions.length > 0 &&
              renderDropdown(fromSuggestions, (val) => setFrom(val))
            }
          </View>

          {/* To Input */}
          <View style={{ zIndex: 2 }}>
            <TextInput
              style={styles.input}
              placeholder="To"
              placeholderTextColor="#8b8686"
              value={to}
              onChangeText={handleToChange}
              onFocus={() => setActiveInput('to')}
              selectionColor="#3a125d"
            />
            {activeInput === 'to' && toSuggestions.length > 0 &&
              renderDropdown(toSuggestions, (val) => setTo(val))
            }
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              {date.toDateString()}
            </Text>
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

        {/* Tour Images */}
        {tourImages.map((item, idx) => (
          <View style={styles.tourCard} key={idx}>
            <Image
              source={{ uri: item.image }}
              style={styles.tourImage}
              resizeMode="cover"
            />
            <Text style={styles.tourTitle}>{item.title}</Text>
            <Text style={styles.tourDesc}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#eceefc',
    alignSelf: 'stretch',
    paddingHorizontal: 0,
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 15,
    width: '90%',
    alignSelf: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#eceefc',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3a125d',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#544d4d',
    marginTop: -5,
    marginBottom: 40,
    width: '90%',
    alignSelf: 'center',
  },
  topSection: {
    zIndex: 0,
    width: '85%',
    maxWidth: 400,
    marginBottom: 0,
    alignSelf: 'center',
  },
  input: {
    height: 48,
    borderColor: '#3a125d',
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f7f7fa',
    justifyContent: 'center',
    color: '#544d4d',
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    alignSelf: 'center',
  },
  dateButton: {
    backgroundColor: '#e89d07',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 3,
    marginTop: 2,
    shadowColor: '#e89d07',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#3a125d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    elevation: 3,
    shadowColor: '#3a125d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    width: '100%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 99,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    color: '#514f4f',
  },
  tourCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    marginHorizontal: 8,
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
  },
  tourImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#eaeaea',
  },
  tourTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#3a125d',
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
  tourDesc: {
    fontSize: 14,
    color: '#544d4d',
    textAlign: 'left',
    marginBottom: 2,
  },
  swapIconWrapperBetween: {
    position: 'absolute',
    top: 42,
    left: '50%',
    marginLeft: -22,
    zIndex: 10,
  },
  swapCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
