// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="(auth)" options={{ headerShown: false }}/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      <Stack.Screen name="admin" options={{ headerShown: false }}/>
      <Stack.Screen name="bus" options={{ headerShown: false }}/>
      <Stack.Screen name="ticket/confirm" options={{ headerShown: false }}/>
      <Stack.Screen name="ticket/ticketHistory" options={{ headerShown: false }}/>
    </Stack>
  );
}

