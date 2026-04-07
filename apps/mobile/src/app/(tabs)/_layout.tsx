import { View } from "react-native";
import { Tabs } from "expo-router";
import { CustomTabBarMobileNative } from "@sd/feature-navigation";
import { MiniPlayerNative } from "@sd/feature-playback";
import { ComponentErrorBoundary } from "@sd/shared";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <>
            <ComponentErrorBoundary fallback={null}>
              <MiniPlayerNative />
            </ComponentErrorBoundary>
            <ComponentErrorBoundary fallback={null}>
              <CustomTabBarMobileNative {...props} />
            </ComponentErrorBoundary>
          </>
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="(search)" />
        <Tabs.Screen name="feed" />
        <Tabs.Screen name="live" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="account" />
      </Tabs>
    </View>
  );
}
