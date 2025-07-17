import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="confirm"
        options={{
          headerShown: true,
          headerTitle: 'Confirm',
          headerTintColor: '#eceefc',
          headerStyle: { backgroundColor: '#3a125d' },
          headerTitleAlign: 'center', // Added to center the header title
          // Custom back button
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 15 }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#eceefc" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ticketHistory"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
