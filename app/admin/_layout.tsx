// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="allBus" options={{ headerShown: false }}/>
      <Stack.Screen name="addBus" options={{ headerShown: false }}/>
      <Stack.Screen name="allUsers" options={{ headerShown: false }}/>
    </Stack>
  );
}

