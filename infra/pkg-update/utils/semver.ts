export function isNewer(a: string, b: string): boolean {
  const strip = (v: string) => v.replace(/^[\^~>=<]+\s*/, "");
  const aParts = strip(a).split(".").map(Number);
  const bParts = strip(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((aParts[i] ?? 0) > (bParts[i] ?? 0)) return true;
    if ((aParts[i] ?? 0) < (bParts[i] ?? 0)) return false;
  }
  return false;
}

export function categorizeBump(
  current: string,
  latest: string,
): "major" | "minor" | "patch" | null {
  const stripRange = (v: string) => v.replace(/^[\^~>=<]+\s*/, "");
  const cur = stripRange(current).split(".").map(Number);
  const lat = stripRange(latest).split(".").map(Number);
  if (cur.length < 2 || lat.length < 2) return null;
  if (cur[0]! < lat[0]!) return "major";
  if (cur[0]! === lat[0]! && cur[1]! < lat[1]!) return "minor";
  if (cur[0]! === lat[0]! && cur[1]! === lat[1]! && cur[2]! < lat[2]!) return "patch";
  return null;
}
