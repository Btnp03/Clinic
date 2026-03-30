// app/_layout.tsx
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="doctor"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="booking/book-appointment"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="booking/booking-summary"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="booking/booking-history"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
};

export default RootLayout;
