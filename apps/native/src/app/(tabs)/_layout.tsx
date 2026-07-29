import { NativeTabs } from "expo-router/unstable-native-tabs";
import { memo } from "react";
import { Platform } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { RouteAccessGuard, useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { BottomAccessoryInnerContent } from "@/features/navigation";

const AdminTabTrigger = memo(function AdminTabTrigger() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = (user as any)?.role === "admin";

  return (
    <NativeTabs.Trigger name="admin" hidden={!isAdmin}>
      <NativeTabs.Trigger.Icon
        sf={{ default: "shield", selected: "shield.fill" }}
        md={{ default: "admin_panel_settings", selected: "admin_panel_settings" }}
      />
      <NativeTabs.Trigger.Label>{t("admin", "Admin")}</NativeTabs.Trigger.Label>
    </NativeTabs.Trigger>
  );
});

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <RouteAccessGuard>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        tintColor={theme.colors.content.primary}
        rippleColor={theme.colors.surface.hover}
        backgroundColor={theme.colors.surface.default}
      >
        <NativeTabs.Trigger name="(explore)">
          <NativeTabs.Trigger.Icon
            sf={{ default: "safari", selected: "safari.fill" }}
            md={{ default: "explore", selected: "explore" }}
          />
          <NativeTabs.Trigger.Label>{t("navigation.explore", "Explore")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="library">
          <NativeTabs.Trigger.Icon
            sf={{ default: "books.vertical", selected: "books.vertical.fill" }}
            md={{ default: "library_books", selected: "library_books" }}
          />
          <NativeTabs.Trigger.Label>{t("navigation.library", "Library")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon
            sf={{ default: "gearshape", selected: "gearshape.fill" }}
            md={{ default: "settings", selected: "settings" }}
          />
          <NativeTabs.Trigger.Label>
            {t("navigation.settings", "Settings")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <AdminTabTrigger />

        {Platform.OS === "ios" ? (
          <NativeTabs.BottomAccessory>
            <BottomAccessoryInnerContent />
          </NativeTabs.BottomAccessory>
        ) : null}
      </NativeTabs>
    </RouteAccessGuard>
  );
}
