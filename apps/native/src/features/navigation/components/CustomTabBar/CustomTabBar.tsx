import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { EaseView } from "react-native-ease";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { getRootTabByRouteName } from "@/features/navigation/utils/tab-route-config";
import { useTranslation } from "@/core/i18n/use-translation";

export const TAB_BAR_HEIGHT = 84;
export const SUBSECTION_BAR_HEIGHT = 56;

type CustomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.scale.sm),
          },
        ]}
      >
        <View style={styles.bar}>
          {state.routes.map((route, index) => {
            const config = getRootTabByRouteName(route.name);

            if (!config) {
              return null;
            }

            const isFocused = state.index === index;
            const options = descriptors[route.key]?.options;
            const label =
              typeof options?.tabBarLabel === "string"
                ? options.tabBarLabel
                : typeof options?.title === "string"
                  ? options.title
                  : t(config.labelKey, config.label);

            const Icon = config.Icon;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`Open ${label}`}
                style={styles.tabPressable}
              >
                <EaseView
                  animate={{
                    scale: isFocused ? 1 : 0.97,
                    opacity: isFocused ? 1 : 0.78,
                  }}
                  transition={{ type: "spring", damping: 12, stiffness: 150 }}
                >
                  <View style={[styles.tab, isFocused && styles.tabActive]}>
                    <Icon
                      color={isFocused ? theme.colors.content.primary : theme.colors.content.muted}
                      size={22}
                      strokeWidth={isFocused ? 2.1 : 1.7}
                    />
                    <Text style={[styles.label, !isFocused && styles.labelMuted]} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                </EaseView>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    paddingHorizontal: theme.spacing.layout.pageX,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: TAB_BAR_HEIGHT,
    paddingHorizontal: theme.spacing.scale.sm,
    paddingTop: theme.spacing.scale.sm,
    borderRadius: theme.radius.component.panel,
    backgroundColor: theme.colors.surface.elevated,
    ...theme.shadows.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  tabPressable: {
    flex: 1,
  },
  tab: {
    minHeight: 52,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scale.xs,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.scale.xs,
    paddingVertical: theme.spacing.scale.xs,
  },
  tabActive: {
    backgroundColor: theme.colors.surface.subtle,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.content.primary,
  },
  labelMuted: {
    color: theme.colors.content.muted,
  },
}));
