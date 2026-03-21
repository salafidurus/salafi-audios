import { Stack } from "expo-router";

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recent" />
      <Stack.Screen name="following" />
    </Stack>
  );
}
