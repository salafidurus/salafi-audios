import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { getFormSheetScreenOptions } from "@/features/navigation/utils/stack-header-options";

export default function ContentLayout() {
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getFormSheetScreenOptions(theme)}>
      <Stack.Screen name="scholars/[slug]" options={{ headerShown: false }} />
      <Stack.Screen name="listings/[slug]" options={{ headerShown: false }} />
    </Stack>
  );
}
