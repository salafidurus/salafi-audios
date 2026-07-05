import type { ViewStyle } from "react-native";

export type RowStyleOptions = {
  gap?: number;
  borderColor?: string;
};

export type RowStyles = {
  defaultRow: ViewStyle;
  listRow: ViewStyle;
  pressed: ViewStyle;
};

export function rowStyles({ gap, borderColor }: RowStyleOptions): RowStyles {
  const defaultRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
  };

  const listRow: ViewStyle = {
    ...defaultRow,
  };

  if (borderColor !== undefined) {
    listRow.borderBottomWidth = 1;
    listRow.borderBottomColor = borderColor;
  }

  if (gap !== undefined) {
    listRow.gap = gap;
  }

  return {
    defaultRow,
    listRow,
    pressed: { opacity: 0.7 },
  };
}
