import { View } from "react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "../../features/navigation/components/CustomTabBar/CustomTabBar";
import { MiniPlayer } from "../../features/playback/components/mini-player/mini-player";
import { ComponentErrorBoundary } from "../../shared/components/error-boundary/ComponentErrorBoundary";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <>
            <ComponentErrorBoundary fallback={null}>
              <MiniPlayer />
            </ComponentErrorBoundary>
            <ComponentErrorBoundary fallback={null}>
              <CustomTabBar {...props} />
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
