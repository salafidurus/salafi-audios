import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { RouteAccessGuard, useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { BottomAccessoryInnerContent } from "@/features/navigation";
import { useBottomAccessoryVisible } from "@/features/navigation/components/BottomAccessory/useBottomAccessoryVisible";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const hasAnyAccess = hasAnyAdminAccess(ability);
  const showBottomAccessory = useBottomAccessoryVisible();

  return (
    <RouteAccessGuard>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        tintColor={theme.colors.content.primary}
        rippleColor={theme.colors.surface.hover}
        indicatorColor={theme.colors.surface.subtle}
        backgroundColor={theme.colors.surface.canvas}
        labelVisibilityMode="labeled"
      >
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md={{ default: "home", selected: "home" }}
          />
          <NativeTabs.Trigger.Label>{t("navigation.home", "Home")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="explore">
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

        <NativeTabs.Trigger name="admin" hidden={!hasAnyAccess}>
          <NativeTabs.Trigger.Icon
            sf={{ default: "shield", selected: "shield.fill" }}
            md={{ default: "admin_panel_settings", selected: "admin_panel_settings" }}
          />
          <NativeTabs.Trigger.Label>
            {t("admin.dashboard.titleMobile", "Admin")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {Platform.OS === "ios" && showBottomAccessory ? (
          <NativeTabs.BottomAccessory>
            <BottomAccessoryInnerContent />
          </NativeTabs.BottomAccessory>
        ) : null}
      </NativeTabs>
    </RouteAccessGuard>
  );
}
