/** Provides the native features settings utils rtl-text-align module responsibility. */
/** Describes the getRtlAwareTextAlign native function contract and behavior. */
export function getRtlAwareTextAlign(direction: "ltr" | "rtl"): "left" | "right" {
  return direction === "rtl" ? "right" : "left";
}
