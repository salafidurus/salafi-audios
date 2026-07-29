import type { ReactNode } from "react";

import { View, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type ListItemActionsProps = {
  /** Action buttons or interactive elements */
  children?: ReactNode;
  /** Controls layout direction: 'vertical' (stacked, default for mobile) or 'horizontal' (row) */
  orientation?: "horizontal" | "vertical";
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
};

export function ListItemActions({
  children,
  orientation = "vertical",
  style,
}: ListItemActionsProps) {
  return (
    <View
      style={[
        styles.actions,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  actions: {
    gap: theme.spacing.scale.xs,
    marginTop: theme.spacing.scale.xs,
  },
  vertical: {
    flexDirection: "column",
    width: "100%",
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
}));
