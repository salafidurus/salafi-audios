import { StyleSheet } from "react-native";

export const borderNative = {
  width: {
    default: 1,
    hairline: StyleSheet.hairlineWidth,
  },
} as const;

export type BorderNative = typeof borderNative;
