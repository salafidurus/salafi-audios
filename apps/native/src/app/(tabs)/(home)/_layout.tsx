import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Defines the Home route group for the native navigation shell. */
/** Owns Home's root-level navigation so future Home detail screens stay local to this destination. */
export default function HomeLayout() {
  const { theme } = useUnistyles();

  return <Stack screenOptions={getTabStackScreenOptions(theme)} />;
}
