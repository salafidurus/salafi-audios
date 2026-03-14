import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

interface ScreenViewProps {
  children: React.ReactNode;
  // style    → outer container (background, safe area padding, etc.)
  // contentStyle → inner content view (gap, alignment overrides, etc.)
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
}

export function ScreenView({ children, style, contentStyle, center }: ScreenViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }, style]}
    >
      <View style={[styles.content, center && styles.center, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.layout.pageX,
    backgroundColor: theme.colors.surface.canvas,
  },
  content: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
}));
