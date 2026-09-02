import { Stack } from "expo-router";

/** Defines the Expo Router entrypoint for the native (tabs)/my-library route and delegates behavior to the feature layer. */
/** Renders the native my library layout surface and coordinates its user-facing state. */
export default function MyLibraryLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
