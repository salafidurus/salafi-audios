import { Tabs } from "expo-router";
import { CustomTabBarMobileNative } from "@sd/feature-navigation";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBarMobileNative {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(search)" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="live" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
