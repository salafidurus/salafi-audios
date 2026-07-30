import type { ReactNode } from "react";

import React from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export type ListItemActionsProps = {
  /** Action buttons or interactive elements */
  children?: ReactNode;
  /** Controls layout direction: 'horizontal' (side-by-side, default) or 'vertical' (stacked) */
  orientation?: "horizontal" | "vertical";
  /** Whether action items should share available space equally (default: true) */
  equalWidth?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
};

export function ListItemActions({
  children,
  orientation = "horizontal",
  equalWidth = true,
  style,
}: ListItemActionsProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <View style={[styles.actions, isHorizontal ? styles.horizontal : styles.vertical, style]}>
      {isHorizontal && equalWidth
        ? React.Children.map(children, (child) =>
            child ? <View style={styles.actionFlexItem}>{child}</View> : null,
          )
        : children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  actions: {
    gap: theme.spacing.scale.xs,
    marginTop: theme.spacing.scale.xs,
    width: "100%",
  },
  vertical: {
    flexDirection: "column",
    width: "100%",
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  actionFlexItem: {
    flex: 1,
  },
}));
