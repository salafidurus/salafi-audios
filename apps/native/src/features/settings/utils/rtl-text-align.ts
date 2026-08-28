/** Provides native account, preference, support, and settings workflows. */
/** Returns the the rtl aware text align used by native consumers. */
export function getRtlAwareTextAlign(direction: "ltr" | "rtl"): "left" | "right" {
  return direction === "rtl" ? "right" : "left";
}
