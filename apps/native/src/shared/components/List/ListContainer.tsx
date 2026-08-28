import type { ReactNode } from "react";

import { View, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Describes the inputs, callbacks, and optional state accepted by List Container. */
export type ListContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Defines the native list container contract used by this module. */
export function ListContainer({ children, style }: ListContainerProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.default,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    overflow: "hidden",
  },
}));
