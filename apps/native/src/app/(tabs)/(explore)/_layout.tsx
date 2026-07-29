import { Stack } from "expo-router";

import { useTranslation } from "@/core/i18n/use-translation";

export default function ExploreLayout() {
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
