import type { ReactNode } from "react";

import { View, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

/** Provides the native shared components List ListContainer module responsibility. */
/** Describes the ListContainerProps native type contract and behavior. */
export type ListContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Describes the ListContainer native function contract and behavior. */
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
