import { Tabs } from "expo-router";
import { CustomTabBar } from "@/features/navigation";
import { RouteAccessGuard } from "@/core/auth";

export default function TabsLayout() {
  return (
    <RouteAccessGuard>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="(search)" options={{ title: "Search", tabBarLabel: "Search" }} />
        <Tabs.Screen name="feed" options={{ title: "Explore", tabBarLabel: "Explore" }} />
        <Tabs.Screen name="library" options={{ title: "Library", tabBarLabel: "Library" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings", tabBarLabel: "Settings" }} />
      </Tabs>
    </RouteAccessGuard>
  );
}
