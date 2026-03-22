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
          backgroundImage: "var(--screen-wash-primary)",
          backgroundRepeat: "no-repeat",
        },
      };
    case "secondaryWash":
      return {
        _web: {
          backgroundImage: "var(--screen-wash-secondary)",
          backgroundRepeat: "no-repeat",
        },
      };
    case "mixedWash":
      return {
        backgroundColor: "var(--accent-mixed-surface, var(--surface-canvas))",
        _web: {
          backgroundImage: "var(--screen-wash-mixed)",
          backgroundRepeat: "no-repeat",
        },
      };
    case "canvas":
    default:
      return undefined;
  }
}
