import { View } from "react-native";
import { Tabs } from "expo-router";
import { CustomTabBarMobileNative } from "@sd/feature-navigation";
import { MiniPlayerNative } from "@sd/feature-playback";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <>
            <MiniPlayerNative />
            <CustomTabBarMobileNative {...props} />
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
