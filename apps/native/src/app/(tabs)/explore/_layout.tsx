import { Stack } from "expo-router";

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Explore",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "prominent",
        }}
      />
      <Stack.Screen name="scholar" />
      <Stack.Screen name="curation" />
    </Stack>
  );
}
