import { StyleSheet } from "react-native-unistyles";
import { Cloud, Search, Mic, Settings, CassetteTape } from "lucide-react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

export type TabIconName = "feed" | "live" | "search" | "library" | "account";

const ICONS = {
  feed: Cloud,
  live: Mic,
  search: Search,
  library: CassetteTape,
  account: Settings,
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

  const Icon = ICONS[name];
  const color = focused ? styles.active.color : styles.inactive.color;

  return (
    <Animated.View style={animatedStyle}>
      <Icon
        color={color}
        size={size}
        strokeWidth={focused ? 1.5 : 2}
        // absoluteStrokeWidth={true}
        // fill={focused ? activeColor : "none"}
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
