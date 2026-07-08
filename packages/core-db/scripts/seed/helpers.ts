/**
 * Helper utilities for seeding
 */

import type { Status } from "../../src/generated/prisma/client.js";

/**
 * Generate deterministic UUID for seed data
 * @param index - Numeric index to pad
 * @returns UUID string
 */
export function uuid(index: number): string {
  return `a0000000-0000-0000-0000-${String(index).padStart(12, "0")}`;
}

/**
 * Determine seed status based on index (every 10th item is draft)
 * @param index - Item index
 * @returns Status enum value
 */
export function seedStatus(index: number): Status {
  return index % 10 === 0 ? "draft" : "published";
}

/**
 * Convert minutes to seconds
 * @param minutes - Duration in minutes
 * @returns Duration in seconds
 */
export function dur(minutes: number): number {
  return minutes * 60;
}
