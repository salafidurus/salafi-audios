import { HapticTab } from "@/shared/components/haptic-tab";
import { TabIcon } from "@/shared/components/tab-icon";
import { BlurView, BlurTargetView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet as RNStyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useRef } from "react";

export default function TabLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const blurTargetRef = useRef<InstanceType<typeof View>>(null);

  const horizontalPadding = theme.spacing.layout.pageX;
  const verticalPadding = Platform.OS === "ios" ? theme.spacing.scale.md : theme.spacing.scale.sm;
  const baseHeight = Platform.OS === "ios" ? 68 : 62;
  const floatingBarBottomInset =
    insets.bottom > 0 ? Math.round(insets.bottom * 0.5) : theme.spacing.scale.sm;
  const tabBarHeight = baseHeight + floatingBarBottomInset;

  const androidTint = theme.colors.surface.canvas === "#0D0D0D" ? "dark" : "light"; // Hardcoded to find dark mode

  return (
    <BlurTargetView ref={blurTargetRef} style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.content.primary,
          tabBarInactiveTintColor: theme.colors.content.muted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: [
            styles.tabBarOuter,
            {
              left: horizontalPadding,
              right: horizontalPadding,
              bottom: verticalPadding,
              height: tabBarHeight,
              paddingBottom: floatingBarBottomInset,
              paddingHorizontal: theme.spacing.component.gapMd,
              backgroundColor: theme.colors.surface.elevated,
            },
          ],
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                tint="systemThinMaterial"
                intensity={65}
                style={[RNStyleSheet.absoluteFill, styles.blurInner]}
              />
            ) : (
              <BlurView
                tint={androidTint}
                intensity={80}
                blurReductionFactor={2}
                blurMethod="dimezisBlurViewSdk31Plus"
                blurTarget={blurTargetRef}
                style={[RNStyleSheet.absoluteFill, styles.blurInner]}
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
  tabBarOuter: {
    position: "absolute",
    borderRadius: theme.radius.component.panel,
    paddingTop: theme.spacing.scale.sm,
    borderTopWidth: 0,
    ...theme.shadows.lg,
  },
  blurInner: {
    borderRadius: theme.radius.component.panel,
    overflow: "hidden",
  },
}));
