import { Stack } from "expo-router";

import { useTranslation } from "@/core/i18n/use-translation";

export default function AdminLayout() {
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
          title: t("admin.title", "Admin Dashboard"),
        }}
      />
      <Stack.Screen
        name="lectures"
        options={{
          title: t("admin.lectures", "Lectures"),
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="scholars"
        options={{
          title: t("admin.scholars", "Scholars"),
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
