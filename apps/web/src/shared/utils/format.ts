/**
 * Formats a number in compact form (e.g. 2100 -> "2.1k", 85000 -> "85k").
 */
export function formatCompactNumber(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const thousands = value / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }
  const millions = value / 1_000_000;
  return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
}
