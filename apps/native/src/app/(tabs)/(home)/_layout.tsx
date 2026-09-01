import { Stack } from "expo-router";

/** Defines the Home route group for the native navigation shell. */
/** Owns Home's root-level navigation so future Home detail screens stay local to this destination. */
export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
