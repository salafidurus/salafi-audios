import type { UniversalStyle } from "@expo/ui";
import type { ReactNode } from "react";

import { Column } from "@expo/ui";
import { StyleSheet as RNStyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

export type ListContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle> | UniversalStyle;
  testID?: string;
};

export function ListContainer({ children, style, testID }: ListContainerProps) {
  const { theme } = useUnistyles();
  const flattenedStyle = (style ? RNStyleSheet.flatten(style) : undefined) as
    | UniversalStyle
    | undefined;

  return (
    <Column testID={testID} style={Object.assign({}, getContainerStyle(theme), flattenedStyle)}>
      {children}
    </Column>
  );
}

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getContainerStyle(theme: Theme) {
  return {
    backgroundColor: theme.colors.surface.default,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
    overflow: "hidden",
  };
}
