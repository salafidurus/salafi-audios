import { Stack } from "expo-router";

import { useTranslation } from "@/core/i18n/use-translation";

export default function SettingsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: false,
        headerLargeTitle: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("navigation.settings", "Settings"),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: t("settings.profile", "Profile"),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="legal"
        options={{
          title: t("settings.legal", "Legal"),
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
