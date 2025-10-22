import React from 'react';
import { Stack} from 'expo-router';

export default function Layout() {

  return (
    <Stack>
      <Stack.Screen name="confirm" options={{headerShown: false,}}/>
      <Stack.Screen name="ticketHistory" options={{ headerShown: false, }}/>
      <Stack.Screen name="ticketPrint" options={{ headerShown: false, }}/>
    </Stack>
  );
}
