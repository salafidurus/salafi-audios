import { Stack } from "expo-router";

/** Provides the native app (auth) _layout module responsibility. */
/** Describes the AuthLayout native function contract and behavior. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
