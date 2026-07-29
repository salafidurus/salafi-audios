import { NativeTabs } from "expo-router/unstable-native-tabs";

import { RouteAccessGuard, useAuth } from "@/core/auth";

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === "admin";

  return (
    <RouteAccessGuard>
      <NativeTabs minimizeBehavior="onScrollDown">
        <NativeTabs.Trigger name="(explore)">
          <NativeTabs.Trigger.Icon
            sf={{ default: "safari", selected: "safari.fill" }}
            md={{ default: "explore", selected: "explore" }}
          />
          <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="library">
          <NativeTabs.Trigger.Icon
            sf={{ default: "books.vertical", selected: "books.vertical.fill" }}
            md={{ default: "library_books", selected: "library_books" }}
          />
          <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon
            sf={{ default: "gearshape", selected: "gearshape.fill" }}
            md={{ default: "settings", selected: "settings" }}
          />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="admin" hidden={!isAdmin}>
          <NativeTabs.Trigger.Icon
            sf={{ default: "shield", selected: "shield.fill" }}
            md={{ default: "admin_panel_settings", selected: "admin_panel_settings" }}
          />
          <NativeTabs.Trigger.Label>Admin</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        {/* Dedicated Search tab for iOS native integration */}
        <NativeTabs.Trigger name="search" role="search">
          <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </RouteAccessGuard>
  );
}
