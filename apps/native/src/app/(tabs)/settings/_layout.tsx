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
    </Stack>
  );
}
