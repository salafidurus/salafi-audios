import { I18nManager } from "react-native";

export function getRtlAwareTextAlign(): "left" | "right" {
  return I18nManager.isRTL ? "right" : "left";
}
