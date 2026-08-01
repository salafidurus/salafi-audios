import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{
          title: t("admin.dashboard.title", "Admin Dashboard"),
        }}
      />
      <Stack.Screen
        name="listings"
        options={{
          title: t("navigation.subnav.admin.listings", "Listings"),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="scholars"
        options={{
          title: t("navigation.admin.scholars", "Scholars"),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="scholar-detail"
        options={{
          title: t("admin.scholarDetail", "Scholar Detail"),
          headerLargeTitle: false,
        }}
      />
    </Stack>
  );
}
