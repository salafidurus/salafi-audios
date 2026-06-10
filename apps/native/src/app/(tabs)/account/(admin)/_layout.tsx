import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Admin" }} />
      <Stack.Screen name="lectures/index" options={{ title: "Lectures" }} />
      <Stack.Screen name="live/index" options={{ title: "Live" }} />
      <Stack.Screen name="scholars/index" options={{ title: "Scholars" }} />
      <Stack.Screen name="scholars/[slug]" options={{ title: "Scholar" }} />
    </Stack>
  );
}
