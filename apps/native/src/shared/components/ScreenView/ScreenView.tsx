import type { ViewStyle } from "react-native";

import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeScreenHost } from "@/shared/ui/native-ui-host";

export interface ScreenViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
  testID?: string;
}

export function ScreenView({
  children,
  style,
  backgroundVariant = "canvas",
  testID,
}: ScreenViewProps) {
  const { theme } = useUnistyles();

  return (
    <NativeScreenHost
      testID={testID}
      style={[styles.container, getBackgroundVariant(backgroundVariant, theme), style]}
    >
      {children}
    </NativeScreenHost>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.layout.pageX,
    backgroundColor: theme.colors.surface.canvas,
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
