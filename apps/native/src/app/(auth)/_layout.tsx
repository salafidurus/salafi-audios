import { Stack } from "expo-router";

/** Defines the Expo Router entrypoint for the native (auth) route and delegates behavior to the feature layer. */
/** Renders the native auth layout surface and coordinates its user-facing state. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
