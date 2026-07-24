import type { ListingFormat } from "@sd/core-contracts";

export function useEligibleFormats(
  format: ListingFormat,
  mode: "create" | "edit",
  childCount: number = 0,
  onlyChildLessonCount: number = 0,
): ListingFormat[] {
  if (mode === "create") {
    return ["single", "series", "collection"];
  }

  const eligible: ListingFormat[] = [format];

  if (format === "single") {
    eligible.push("series");
  } else if (format === "series") {
    eligible.push("collection");
  }

  if (format === "series") {
    if (childCount <= 1) {
      eligible.push("single");
    }
  } else if (format === "collection") {
    if (childCount <= 1) {
      eligible.push("series");
    }
    if (childCount === 0 || (childCount === 1 && onlyChildLessonCount <= 1)) {
      eligible.push("single");
    }
  }

  return eligible;
}
