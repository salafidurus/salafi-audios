import { StyleSheet } from "react-native";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
/** Defines the native border token set consumed by themed components. */
export const borderNative = {
  width: {
    default: 1,
    hairline: StyleSheet.hairlineWidth,
  },
} as const;

/** Defines shared native border tokens consumed by the application theme. */
export type BorderNative = typeof borderNative;
