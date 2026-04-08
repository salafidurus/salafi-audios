import { View } from "react-native";
import { Tabs } from "expo-router";
import { CustomTabBarMobileNative } from "../../features/navigation/components/CustomTabBar/CustomTabBar";
import { MiniPlayerNative } from "@sd/feature-playback";
import { ComponentErrorBoundary } from "../../shared/components/error-boundary/ComponentErrorBoundary";

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
