import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

export default function SettingsLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: t("navigation.settings", "Settings"),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: t("navigation.subnav.settings.profile", "Profile"),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="legal"
        options={{
          title: t("account.legal", "Legal"),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          title: t("settings.support", "Support"),
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
