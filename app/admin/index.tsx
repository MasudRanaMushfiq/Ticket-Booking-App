import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleAllBus = () => router.push('/admin/allbus');
  const handleAddBus = () => router.push('/admin/addbus');
  const handleAllUser = () => router.push('/admin/allusers');
  const handleComplain = () => router.push('/admin/complains');
  const handleVerifyBooking = () => router.push('/admin/verifybooking');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#3B7CF5" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleAllBus}>
          <Ionicons name="bus-outline" size={20} color="#3B7CF5" style={styles.icon} />
          <Text style={styles.buttonText}>All Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAllUser}>
          <Ionicons name="people-outline" size={20} color="#3B7CF5" style={styles.icon} />
          <Text style={styles.buttonText}>All Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAddBus}>
          <Ionicons name="add-circle-outline" size={20} color="#3B7CF5" style={styles.icon} />
          <Text style={styles.buttonText}>Add Bus</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleComplain}>
          <Ionicons name="wallet-outline" size={20} color="#3B7CF5" style={styles.icon} />
          <Text style={styles.buttonText}>All Complaint</Text>
        </TouchableOpacity>

        {/* New Verify Booking Button */}
        <TouchableOpacity style={styles.button} onPress={handleVerifyBooking}>
          <Ionicons name="checkmark-done-outline" size={20} color="#3B7CF5" style={styles.icon} />
          <Text style={styles.buttonText}>Verify Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eceefc',
  },
  header: {
    backgroundColor: '#3B7CF5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  backBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#3B7CF5',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    color: '#544d4d',
    fontWeight: '500',
  },
});


