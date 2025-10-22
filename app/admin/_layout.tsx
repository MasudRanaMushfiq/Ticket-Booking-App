// app/_layout.tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="allbus" options={{ headerShown: false }}/>
      <Stack.Screen name="addbus" options={{ headerShown: false }}/>
      <Stack.Screen name="allusers" options={{ headerShown: false }}/>
      <Stack.Screen name="complains" options={{ headerShown: false }}/>
      <Stack.Screen name="contacts" options={{ headerShown: false }}/>
    </Stack>
  );
}

