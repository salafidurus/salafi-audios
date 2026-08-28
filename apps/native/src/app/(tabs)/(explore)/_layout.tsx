import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

/** Provides the native app (tabs) (explore) _layout module responsibility. */
/** Describes the ExploreLayout native function contract and behavior. */
export default function ExploreLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: t("navigation.subnav.explore.recent", "Recent"),
        }}
      />
      <Stack.Screen
        name="scholar"
        options={{
          title: t("navigation.subnav.explore.scholar", "Scholars"),
        }}
      />
      <Stack.Screen
        name="curation"
        options={{
          title: t("navigation.subnav.explore.curation", "Curation"),
        }}
      />
    </Stack>
  );
}
