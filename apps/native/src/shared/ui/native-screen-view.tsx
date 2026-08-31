import { Host } from "@expo/ui";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet as UnistylesStyleSheet, useUnistyles } from "react-native-unistyles";

import { createUniversalHostProps } from "../../core/styles/expo-ui";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Describes the inputs, callbacks, and optional state accepted by Screen View. */
export interface ScreenViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

/** Renders the native screen view surface and coordinates its user-facing state. */
export function ScreenView({
  children,
  style,
  contentStyle,
  center,
  backgroundVariant = "canvas",
}: ScreenViewProps) {
  const insets = useSafeAreaInsets();
  const { theme, rt } = useUnistyles();
  const hostProps = createUniversalHostProps(theme, rt.themeName);

  return (
    <Host style={{ flex: 1 }} {...hostProps}>
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
    </Host>
  );
}

const styles = UnistylesStyleSheet?.create((theme) => ({
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
})) ?? {
  container: {},
  content: {},
  center: {},
};

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
