import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F7F2E7",
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
