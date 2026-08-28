import { StyleSheet } from "react-native";

/** Provides the native core styles theme border module responsibility. */
/** Describes the const borderNative = { native declaration contract and behavior. */
export const borderNative = {
  width: {
    default: 1,
    hairline: StyleSheet.hairlineWidth,
  },
} as const;

/** Describes the BorderNative native type contract and behavior. */
export type BorderNative = typeof borderNative;
