/**
 * Type guards and validators for form field values.
 * Ensures type safety when casting dropdown/select values.
 */

import { StatusValueSchema, type StatusValue } from "@sd/core-contracts";

// Status type for lectures — sourced from the shared backend contract so the
// web form can't silently drift out of sync with the API's status enum.
export const LECTURE_STATUS_VALUES = StatusValueSchema.options;
export type LectureStatus = StatusValue;

export function isLectureStatus(val: unknown): val is LectureStatus {
  return typeof val === "string" && LECTURE_STATUS_VALUES.includes(val as any);
}

export function validateLectureStatus(
  val: string,
  fallback: LectureStatus = "draft",
): LectureStatus {
  return isLectureStatus(val) ? val : fallback;
}

// Language type for scholars and content
export const LANGUAGE_CODES = ["en", "ar"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export function isLanguageCode(val: unknown): val is LanguageCode {
  return typeof val === "string" && LANGUAGE_CODES.includes(val as any);
}

export function validateLanguageCode(val: string, fallback: LanguageCode = "ar"): LanguageCode {
  return isLanguageCode(val) ? val : fallback;
}

// Country codes - all ISO 3166-1 alpha-2 codes used in the app
export const COUNTRY_CODES = [
  "SA",
  "AE",
  "EG",
  "IQ",
  "JO",
  "KW",
  "LB",
  "LY",
  "MA",
  "OM",
  "PS",
  "QA",
  "SD",
  "SY",
  "TN",
  "YE",
  "AU",
  "CA",
  "US",
  "GB",
  "OTHER",
] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

export function isCountryCode(val: unknown): val is CountryCode {
  return typeof val === "string" && COUNTRY_CODES.includes(val as any);
}

export function validateCountryCode(val: string, fallback: CountryCode = "SA"): CountryCode {
  return isCountryCode(val) ? val : fallback;
}

// Mapping of country codes to display names
export const COUNTRY_NAMES: Record<CountryCode, string> = {
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  EG: "Egypt",
  IQ: "Iraq",
  JO: "Jordan",
  KW: "Kuwait",
  LB: "Lebanon",
  LY: "Libya",
  MA: "Morocco",
  OM: "Oman",
  PS: "Palestine",
  QA: "Qatar",
  SD: "Sudan",
  SY: "Syria",
  TN: "Tunisia",
  YE: "Yemen",
  AU: "Australia",
  CA: "Canada",
  US: "United States",
  GB: "United Kingdom",
  OTHER: "Other",
};

// Sorted country list for dropdowns
export const COUNTRY_LIST = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code: code as CountryCode,
  name,
}));
