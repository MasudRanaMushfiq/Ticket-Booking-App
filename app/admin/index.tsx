import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();

  const handleAllBus = () => {
    router.push('/admin/allBus');
  };

  const handleAddBus = () => {
    router.push('/admin/addBus');
  };

  const handleAllUser = () => {
    router.push('/admin/allUsers');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <TouchableOpacity style={styles.button} onPress={handleAllBus}>
        <Ionicons name="bus-outline" size={20} color="#3a125d" style={styles.icon} />
        <Text style={styles.buttonText}>All Bus</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAddBus}>
        <Ionicons name="add-circle-outline" size={20} color="#3a125d" style={styles.icon} />
        <Text style={styles.buttonText}>Add Bus</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAllUser}>
        <Ionicons name="people-outline" size={20} color="#3a125d" style={styles.icon} />
        <Text style={styles.buttonText}>All Users</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#eceefc', // Background Color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 30,
    marginLeft: 16,
    color: '#3a125d', // Primary Color
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#3a125d',
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
    color: '#544d4d', // Text Color
    fontWeight: '500',
  },
});
