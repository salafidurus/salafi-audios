import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getFormSheetScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Provides the native app (content) _layout module responsibility. */
/** Describes the ContentLayout native function contract and behavior. */
export default function ContentLayout() {
  const { theme } = useUnistyles();

  return <Stack screenOptions={getFormSheetScreenOptions(theme)} />;
}
