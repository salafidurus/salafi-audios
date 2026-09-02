import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getFormSheetScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Defines the Expo Router entrypoint for the native (content) route and delegates behavior to the feature layer. */
/** Renders the native content layout surface and coordinates its user-facing state. */
export default function ContentLayout() {
  const { theme } = useUnistyles();

  return <Stack screenOptions={getFormSheetScreenOptions(theme)} />;
}
