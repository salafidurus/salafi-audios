import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Provides the native app (tabs) my-library _layout module responsibility. */
/** Describes the MyLibraryLayout native function contract and behavior. */
export default function MyLibraryLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: t("myLibrary.inProgress", "In Progress"),
        }}
      />
      <Stack.Screen
        name="saved"
        options={{
          title: t("myLibrary.saved", "Saved"),
        }}
      />
      <Stack.Screen
        name="completed"
        options={{
          title: t("myLibrary.completed", "Completed"),
        }}
      />
    </Stack>
  );
}
