// app/_layout.tsx
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="availablebus"
        options={{
          headerShown: true,
          headerTitle: 'Available Bus',
          headerStyle: {
            backgroundColor: '#3a125d', // Primary color
          },
          headerTintColor: '#eceefc',   // Back arrow and title color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="availableseat"
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Select Your Seat',
          headerStyle: {
            backgroundColor: '#3a125d',
          },
          headerTintColor: '#eceefc',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="#eceefc" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack>
  );
}
