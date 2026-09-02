import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { RouteAccessGuard } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { BottomAccessoryContent } from "@/features/navigation/components/BottomAccessory/BottomAccessoryContent";

/** Defines the Expo Router entrypoint for the native (tabs) route and delegates behavior to the feature layer. */
/** Renders the native tabs layout surface and coordinates its user-facing state. */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  return (
    <RouteAccessGuard>
      <NativeTabs
        minimizeBehavior="onScrollDown"
        tintColor={theme.colors.content.primary}
        rippleColor={theme.colors.surface.hover}
        indicatorColor={theme.colors.surface.subtle}
        backgroundColor={theme.colors.surface.default}
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

        <NativeTabs.Trigger name="scholars">
          <NativeTabs.Trigger.Icon
            sf={{ default: "person.3", selected: "person.3.fill" }}
            md={{ default: "school", selected: "school" }}
          />
          <NativeTabs.Trigger.Label>
            {t("navigation.scholars", "Scholars")}
          </NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="my-library">
          <NativeTabs.Trigger.Icon
            sf={{ default: "books.vertical", selected: "books.vertical.fill" }}
            md={{ default: "library_books", selected: "library_books" }}
          />
          <NativeTabs.Trigger.Label>
            {t("navigation.myLibrary", "My Library")}
          </NativeTabs.Trigger.Label>
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

        {Platform.OS === "ios" ? (
          <NativeTabs.BottomAccessory>
            <BottomAccessoryContent />
          </NativeTabs.BottomAccessory>
        ) : null}
      </NativeTabs>
    </RouteAccessGuard>
  );
}
