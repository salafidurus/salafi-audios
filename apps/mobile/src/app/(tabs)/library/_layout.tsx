import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="completed" />
    </Stack>
  );
}
