import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse totalPrice from params (assumed sent as string)
  const totalPrice = params.totalPrice ? Number(params.totalPrice) : 0;

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const paymentOptions = [
    { key: 'mobile_banking', label: 'Mobile Banking', icon: 'phone-portrait' },
    { key: 'banking', label: 'Banking', icon: 'cash' },
    { key: 'card', label: 'Card', icon: 'card' },
  ];

  const handleMakePayment = () => {
    if (!paymentMethod) {
      Alert.alert('Select Payment Method', 'Please choose a payment method first.');
      return;
    }

    // Here you would integrate real payment logic or navigate to payment gateway
    Alert.alert(
      'Payment',
      `You selected ${paymentOptions.find((o) => o.key === paymentMethod)?.label}. Total: ৳${totalPrice}`
    );

    // After payment success, navigate to success page or home
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Total Price:</Text>
        <Text style={styles.priceValue}>৳ {totalPrice}</Text>
      </View>

      <Text style={styles.subtitle}>Select Payment Method</Text>

      <View style={styles.optionsContainer}>
        {paymentOptions.map(({ key, label, icon }) => {
          const selected = paymentMethod === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => setPaymentMethod(key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={selected ? '#fff' : '#3a125d'}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.optionLabel, selected && { color: '#fff' }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.payButton, !paymentMethod && { backgroundColor: '#999' }]}
        onPress={handleMakePayment}
        disabled={!paymentMethod}
        activeOpacity={0.8}
      >
        <Text style={styles.payButtonText}>Make Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceefc',
    padding: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3a125d',
    marginBottom: 30,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  priceLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#475569',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0c893aff',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3a125d',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 40,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#3a125d',
    borderWidth: 2,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  optionSelected: {
    backgroundColor: '#3a125d',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3a125d',
  },
  payButton: {
    backgroundColor: '#3a125d',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonText: {
    color: '#eceefc',
    fontSize: 20,
    fontWeight: '700',
  },
});
