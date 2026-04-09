import { View } from "react-native";
import { Tabs } from "expo-router";
import { CustomTabBar } from "../../features/navigation/components/CustomTabBar/CustomTabBar";
import { MiniPlayer } from "../../features/playback/components/mini-player/mini-player";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <>
            <MiniPlayer />
            <CustomTabBar {...props} />
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
