import * as Haptics from "expo-haptics";

type HapticStyle = "light" | "medium" | "heavy" | "soft" | "rigid";

export function useHaptic(style: HapticStyle = "light") {
  return () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle[
        (style.charAt(0).toUpperCase() + style.slice(1)) as keyof typeof Haptics.ImpactFeedbackStyle
      ],
    );
  };
}
