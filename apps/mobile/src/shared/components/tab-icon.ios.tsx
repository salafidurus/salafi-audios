import { IconSymbol } from "@/components/ui/icon-symbol";
import { StyleSheet } from "react-native-unistyles";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

export type TabIconName = "house" | "radio" | "search" | "library" | "user";

const SYMBOLS: Record<TabIconName, Parameters<typeof IconSymbol>[0]["name"]> = {
  house: "house",
  radio: "dot.radiowaves.left.and.right",
  search: "magnifyingglass",
  library: "books.vertical",
  user: "person.circle",
};

type TabIconProps = {
  name: TabIconName;
  focused: boolean;
  size?: number;
};

export function TabIcon({ name, focused, size = 24 }: TabIconProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(focused ? 1.08 : 1, { duration: 160 }) }],
    opacity: withTiming(focused ? 1 : 0.72, { duration: 160 }),
  }));

  const color = focused ? styles.active.color : styles.inactive.color;

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol
        name={SYMBOLS[name]}
        size={size}
        color={color}
        weight={focused ? "semibold" : "regular"}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  active: {
    color: theme.colors.content.primary,
  },
  inactive: {
    color: theme.colors.content.muted,
  },
}));
