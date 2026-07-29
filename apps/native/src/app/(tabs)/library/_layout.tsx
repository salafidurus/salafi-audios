import { Stack } from "expo-router";

import { useTranslation } from "@/core/i18n/use-translation";

export default function LibraryLayout() {
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
