export const borderNative = {
  width: {
    default: 1,
    hairline: -1, // Sentinel for StyleSheet.hairlineWidth, resolved in unistyles.ts
  },
} as const;

export type BorderNative = typeof borderNative;
