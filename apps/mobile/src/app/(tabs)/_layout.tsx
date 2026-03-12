import { HapticTab } from "@/shared/components/haptic-tab";
import { TabIcon } from "@/shared/components/tab-icon";
import { BlurTargetView, BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet as RNStyleSheet, useColorScheme, type View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRef } from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const blurTargetRef = useRef<View | null>(null);

  const horizontalPadding = theme.spacing.layout.pageX;
  const verticalPadding = Platform.OS === "ios" ? theme.spacing.scale.md : theme.spacing.scale.sm;
  const baseHeight = Platform.OS === "ios" ? 68 : 62;
  const safeBottomInset =
    insets.bottom > 0 ? Math.round(insets.bottom * 0.5) : theme.spacing.scale.sm;
  const tabBarHeight = baseHeight + safeBottomInset;

  const blurIntensity = Platform.OS === "ios" ? 35 : 25;
  const blurTint = isDark ? "dark" : "light";
  const fallbackColor = theme.colors.surface.elevated;

  return (
    <BlurTargetView ref={blurTargetRef} style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.content.primary,
          tabBarInactiveTintColor: theme.colors.content.muted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: [
            styles.tabBarBase,
            {
              left: horizontalPadding,
              right: horizontalPadding,
              bottom: verticalPadding,
              height: tabBarHeight,
              paddingBottom: safeBottomInset,
              backgroundColor: fallbackColor,
            },
          ],
          tabBarBackground: () => (
            <BlurView
              intensity={blurIntensity}
              tint={blurTint}
              style={RNStyleSheet.absoluteFill}
              blurTarget={Platform.OS === "android" ? blurTargetRef : undefined}
              blurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="(feed)"
          options={{
            title: "Feed",
            tabBarIcon: ({ focused }) => <TabIcon name="feed" focused={focused} size={26} />,
          }}
        />
        <Tabs.Screen
          name="(live)"
          options={{
            title: "Live",
            tabBarIcon: ({ focused }) => <TabIcon name="live" focused={focused} size={26} />,
          }}
        />
        <Tabs.Screen
          name="(search)"
          options={{
            title: "Search",
            tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} size={26} />,
          }}
        />
        <Tabs.Screen
          name="(library)"
          options={{
            title: "Library",
            tabBarIcon: ({ focused }) => <TabIcon name="library" focused={focused} size={26} />,
          }}
        />
        <Tabs.Screen
          name="(account)"
          options={{
            title: "Account",
            tabBarIcon: ({ focused }) => <TabIcon name="account" focused={focused} size={26} />,
          }}
        />
      </Tabs>
    </BlurTargetView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  tabBarBase: {
    position: "absolute",
    borderRadius: theme.radius.component.panel,
    paddingTop: theme.spacing.scale.sm,
    borderTopWidth: 0,
    ...theme.shadows.lg,
    overflow: "hidden",
  },
}));
