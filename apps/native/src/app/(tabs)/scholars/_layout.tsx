import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Defines the Scholars route group for the native navigation shell. */
/** Owns Scholars' root stack so scholar detail navigation remains separate from the tab shell. */
export default function ScholarsLayout() {
  const { theme } = useUnistyles();

  return <Stack screenOptions={getTabStackScreenOptions(theme)} />;
}
