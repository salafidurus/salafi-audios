import { Stack } from "expo-router";

/** Defines the Explore route group for the native navigation shell. */
/** Owns Explore's root stack so discovery screens can be pushed without changing tab ownership. */
export default function ExploreLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
