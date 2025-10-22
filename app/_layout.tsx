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
      <Stack.Screen name="ticket" options={{ headerShown: false }}/>
      <Stack.Screen name="payment/payment" options={{ headerShown: false }}/>
      <Stack.Screen name="ticket/ticketPrint" options={{ headerShown: false }}/>
      <Stack.Screen name="bus/availablebus" options={{ headerShown: false }}/>
      <Stack.Screen name="bus/availableseat" options={{ headerShown: false }}/>
      <Stack.Screen name="ticket/confirm.tsx" options={{ headerShown: false }}/>
      <Stack.Screen name="ticket/ticketHistory" options={{ headerShown: false }}/>
      <Stack.Screen name="screen/editprofile" options={{ headerShown: false }}/>
    </Stack>
  );
}

