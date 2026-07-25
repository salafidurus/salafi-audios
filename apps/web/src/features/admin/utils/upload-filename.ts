import type { AdminArrangeLessonDto } from "@sd/core-contracts";

export interface ParsedUploadFilename {
  title: string;
  numericPrefix: number | null;
  ext: string;
}

const PREFIXED_PATTERN = /^(\d{1,4})[\s._-]+(.+)\.([A-Za-z0-9]+)$/;
const PLAIN_PATTERN = /^(.+)\.([A-Za-z0-9]+)$/;

export function parseUploadFilename(name: string): ParsedUploadFilename {
  const prefixed = name.match(PREFIXED_PATTERN);
  if (prefixed) {
    const [, prefix = "", title = "", ext = ""] = prefixed;
    return { title: title.trim(), numericPrefix: parseInt(prefix, 10), ext: ext.toLowerCase() };
  }
  const plain = name.match(PLAIN_PATTERN);
  if (plain) {
    const [, title = "", ext = ""] = plain;
    return { title: title.trim(), numericPrefix: null, ext: ext.toLowerCase() };
  }
  return { title: name.trim(), numericPrefix: null, ext: "" };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deriveChildSlug(parentSlug: string, title: string): string {
  const fragment = slugify(title);
  return fragment ? `${parentSlug}-${fragment}` : parentSlug;
}

export function findSlugMatch(
  candidateSlug: string,
  lessons: AdminArrangeLessonDto[],
): AdminArrangeLessonDto | null {
  return lessons.find((lesson) => lesson.slug === candidateSlug) ?? null;
}
