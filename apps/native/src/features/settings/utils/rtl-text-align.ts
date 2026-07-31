export function getRtlAwareTextAlign(direction: "ltr" | "rtl"): "left" | "right" {
  return direction === "rtl" ? "right" : "left";
}
