import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="availableBus"
        options={{
          headerShown: true,
          headerTitle: 'Available Bus',
          headerStyle: {
            backgroundColor: '#3a125d', // primary color
          },
          headerTintColor: '#eceefc', // header text color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="availableSeat"
        options={{
          headerShown: true,
          headerTitle: 'Available Seat',
          headerStyle: {
            backgroundColor: '#3a125d',
          },
          headerTintColor: '#eceefc',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      />
    </Stack>
  );
}
