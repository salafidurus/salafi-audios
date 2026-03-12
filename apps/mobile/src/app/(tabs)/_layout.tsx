import { HapticTab } from "@/shared/components/haptic-tab";
import { TabIcon } from "@/shared/components/tab-icon";
import { Colors } from "@sd/design-tokens";
import { useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[theme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="(feed)"
        options={{
          title: "Feed",
          tabBarIcon: ({ focused }) => <TabIcon name="house" focused={focused} size={28} />,
        }}
      />
      <Tabs.Screen
        name="(live)"
        options={{
          title: "Live",
          tabBarIcon: ({ focused }) => <TabIcon name="radio" focused={focused} size={28} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} size={28} />,
        }}
      />
      <Tabs.Screen
        name="(library)"
        options={{
          title: "Library",
          tabBarIcon: ({ focused }) => <TabIcon name="library" focused={focused} size={28} />,
        }}
      />
      <Tabs.Screen
        name="(account)"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} size={28} />,
        }}
      />
    </Tabs>
  );
}
