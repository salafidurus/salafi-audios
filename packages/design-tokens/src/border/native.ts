export const borderNative = {
  width: {
    default: 1,
    hairline: -1, // Sentinel value for StyleSheet.hairlineWidth, resolved in apps/native
  },
} as const;

export type BorderNative = typeof borderNative;
