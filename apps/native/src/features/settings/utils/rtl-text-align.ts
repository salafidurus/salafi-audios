/** Converts native layout direction into the explicit alignment used by settings fields. */
/** Maps the two supported directions to explicit left/right native text alignment. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export function getRtlAwareTextAlign(direction: "ltr" | "rtl"): "left" | "right" {
  return direction === "rtl" ? "right" : "left";
}
