import { Tabs } from "expo-router";
import { CustomTabBar } from "../../features/navigation";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="(search)" options={{ title: "Search", tabBarLabel: "Search" }} />
      <Tabs.Screen name="feed" options={{ title: "Feed", tabBarLabel: "Feed" }} />
      <Tabs.Screen name="live" options={{ title: "Live", tabBarLabel: "Live" }} />
      <Tabs.Screen name="library" options={{ title: "Library", tabBarLabel: "Library" }} />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarLabel: "Account" }} />
    </Tabs>
  );
}
