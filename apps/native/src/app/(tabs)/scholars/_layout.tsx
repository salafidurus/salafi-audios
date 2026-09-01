import { Stack } from "expo-router";

/** Defines the Scholars route group for the native navigation shell. */
/** Owns Scholars' root stack so scholar detail navigation remains separate from the tab shell. */
export default function ScholarsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
