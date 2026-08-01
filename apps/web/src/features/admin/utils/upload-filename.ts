import type { AdminArrangeLessonDto } from "@sd/core-contracts";

export { slugify, deriveChildSlug } from "./slugify";

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

export function findSlugMatch(
  candidateSlug: string,
  lessons: AdminArrangeLessonDto[],
): AdminArrangeLessonDto | null {
  return lessons.find((lesson) => lesson.slug === candidateSlug) ?? null;
}
