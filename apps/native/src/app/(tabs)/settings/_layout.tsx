import { Stack } from "expo-router";

/** Defines the Expo Router entrypoint for the native (tabs)/settings route and delegates behavior to the feature layer. */
/** Renders the native settings layout surface and coordinates its user-facing state. */
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
