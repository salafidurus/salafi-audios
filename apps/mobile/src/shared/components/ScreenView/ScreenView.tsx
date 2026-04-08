import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface ScreenViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

export function ScreenViewMobileNative({
  children,
  style,
  contentStyle,
  center,
  backgroundVariant = "canvas",
}: ScreenViewProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        styles.container,
        getBackgroundVariant(backgroundVariant, theme),
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        style,
      ]}
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

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getBackgroundVariant(
  variant: ScreenViewProps["backgroundVariant"],
  theme: Theme,
): ViewStyle | undefined {
  switch (variant) {
    case "primaryWash":
      return { backgroundColor: theme.recipes.primarySubtleSurface.backgroundColor };
    case "secondaryWash":
      return { backgroundColor: theme.colors.surface.secondarySubtle };
    case "mixedWash":
      return { backgroundColor: theme.recipes.mixedHeroSurface.backgroundColor };
    case "canvas":
    default:
      return undefined;
  }
}
