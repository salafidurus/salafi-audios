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
  if (prefixed) return parsePrefixedFilename(prefixed);
  const plain = name.match(PLAIN_PATTERN);
  if (plain) return parsePlainFilename(plain);
  return { title: name.trim(), numericPrefix: null, ext: "" };
}

function parsePrefixedFilename(match: RegExpMatchArray): ParsedUploadFilename {
  const prefix = match[1] ?? "";
  const title = match[2] ?? "";
  const ext = match[3] ?? "";
  return { title: title.trim(), numericPrefix: parseInt(prefix, 10), ext: ext.toLowerCase() };
}

function parsePlainFilename(match: RegExpMatchArray): ParsedUploadFilename {
  const title = match[1] ?? "";
  const ext = match[2] ?? "";
  return { title: title.trim(), numericPrefix: null, ext: ext.toLowerCase() };
}

export function findSlugMatch(
  candidateSlug: string,
  lessons: AdminArrangeLessonDto[],
): AdminArrangeLessonDto | null {
  return lessons.find((lesson) => lesson.slug === candidateSlug) ?? null;
}
