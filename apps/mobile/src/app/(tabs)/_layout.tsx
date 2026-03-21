import {
  CustomTabBarMobileNative,
  SubsectionBarHostMobileNative,
  getSceneBottomInsetForPath,
} from "@sd/feature-navigation";
import { Tabs, usePathname } from "expo-router";

export default function TabsLayout() {
  const pathname = usePathname();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBarMobileNative {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            paddingBottom: getSceneBottomInsetForPath(pathname),
          },
        }}
      >
        <Tabs.Screen name="feed" options={{ title: "Feed" }} />
        <Tabs.Screen name="live" options={{ title: "Live" }} />
        <Tabs.Screen name="(search)" options={{ title: "Search" }} />
        <Tabs.Screen name="library" options={{ title: "Library" }} />
        <Tabs.Screen name="account" options={{ title: "Account" }} />
      </Tabs>
      <SubsectionBarHostMobileNative />
    </>
  );
}
