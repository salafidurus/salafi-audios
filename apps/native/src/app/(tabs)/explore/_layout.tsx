import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Defines the Explore route group for the native navigation shell. */
/** Owns Explore's root stack so discovery screens can be pushed without changing tab ownership. */
export default function ExploreLayout() {
  const { theme } = useUnistyles();

  return <Stack screenOptions={getTabStackScreenOptions(theme)} />;
}
