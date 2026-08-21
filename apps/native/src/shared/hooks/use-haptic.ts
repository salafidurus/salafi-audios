import * as Haptics from "expo-haptics";

type HapticStyle = "light" | "medium" | "heavy" | "soft" | "rigid";

const IMPACT_STYLE_BY_NAME = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  soft: Haptics.ImpactFeedbackStyle.Soft,
  rigid: Haptics.ImpactFeedbackStyle.Rigid,
} satisfies Record<HapticStyle, Haptics.ImpactFeedbackStyle>;

export function useHaptic(style: HapticStyle = "light") {
  return () => {
    Haptics.impactAsync(IMPACT_STYLE_BY_NAME[style]);
  };
}
