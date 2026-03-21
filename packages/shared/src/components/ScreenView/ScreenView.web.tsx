import { type ViewStyle } from "react-native";
import { View } from "react-native-unistyles/components/native/View";
import { StyleSheet } from "react-native-unistyles";

export interface ScreenViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  center?: boolean;
  backgroundVariant?: "canvas" | "primaryWash" | "secondaryWash" | "mixedWash";
}

export function ScreenViewWeb({
  children,
  style,
  contentStyle,
  center,
  backgroundVariant = "canvas",
}: ScreenViewProps) {
  return (
    <View style={[styles.container, getBackgroundVariant(backgroundVariant), style]}>
      <View style={[styles.content, center && styles.center, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
    _web: {
      paddingHorizontal: theme.spacing.layout.pageX,
      paddingVertical: theme.spacing.layout.pageY,
    },
  },
  content: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
  },
}));

function getBackgroundVariant(variant: ScreenViewProps["backgroundVariant"]) {
  switch (variant) {
    case "primaryWash":
      return {
        _web: {
          backgroundImage:
            "radial-gradient(circle at 12% 14%, var(--surface-primary-subtle), transparent 42%)",
        },
      };
    case "secondaryWash":
      return {
        _web: {
          backgroundImage:
            "radial-gradient(circle at 14% 14%, var(--surface-secondary-subtle), transparent 40%)",
        },
      };
    case "mixedWash":
      return {
        backgroundColor: "var(--accent-mixed-surface, var(--surface-canvas))",
        _web: {
          backgroundImage:
            "radial-gradient(circle at 14% 12%, var(--surface-primary-subtle), transparent 38%), radial-gradient(circle at 88% 10%, var(--surface-secondary-subtle), transparent 32%)",
        },
      };
    case "canvas":
    default:
      return undefined;
  }
}
