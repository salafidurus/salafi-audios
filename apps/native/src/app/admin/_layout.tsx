import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import { Stack } from "expo-router";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { getTabStackScreenOptions } from "@/features/navigation/utils/stack-header-options";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

/** The Admin stack is independent from the five listener-facing root destinations. */
/** Renders the capability-aware Admin stack and denies unauthorized access before its screens mount. */
export default function AdminLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading } = useAbility({ isAuthenticated });

  if (isLoading) {
    return <EmptyState variant="loading" message={t("admin.checkingAccess", "Checking access…")} />;
  }

  if (!hasAnyAdminAccess(ability)) {
    return (
      <EmptyState
        variant="error"
        message={t("admin.accessDenied", "You do not have admin access.")}
      />
    );
  }

  return (
    <Stack screenOptions={getTabStackScreenOptions(theme)}>
      <Stack.Screen
        name="index"
        options={{ title: t("admin.dashboard.title", "Admin Dashboard") }}
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
        options={{ title: t("navigation.admin.scholars", "Scholars"), headerLargeTitle: false }}
      />
      <Stack.Screen
        name="scholar-detail"
        options={{ title: t("admin.scholarDetail", "Scholar Detail"), headerLargeTitle: false }}
      />
    </Stack>
  );
}
