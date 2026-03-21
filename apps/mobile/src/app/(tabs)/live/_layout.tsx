import { Stack } from "expo-router";

export default function LiveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scheduled" />
      <Stack.Screen name="ended" />
    </Stack>
  );
}
