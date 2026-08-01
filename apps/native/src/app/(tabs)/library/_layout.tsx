import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

export default function LibraryLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: t("library.inProgress", "In Progress"),
        }}
      />
      <Stack.Screen
        name="saved"
        options={{
          title: t("library.saved", "Saved"),
        }}
      />
      <Stack.Screen
        name="completed"
        options={{
          title: t("library.completed", "Completed"),
        }}
      />
    </Stack>
  );
}
