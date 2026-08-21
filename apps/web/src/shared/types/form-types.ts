import { StatusValueSchema, type StatusValue } from "@sd/core-contracts";
import { z } from "zod";

// Status type for lectures — sourced from the shared backend contract so the
// web form can't silently drift out of sync with the API's status enum.
export const LECTURE_STATUS_VALUES = StatusValueSchema.options;
export type LectureStatus = StatusValue;

export function isLectureStatus(value: string): boolean {
  return StatusValueSchema.safeParse(value).success;
}

export function validateLectureStatus(
  value: string,
  fallback: LectureStatus = "draft",
): LectureStatus {
  const parsed = StatusValueSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

// Language type for scholars and content
export const LANGUAGE_CODES = ["en", "ar"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];
const LanguageCodeSchema = z.enum(LANGUAGE_CODES);

export function isLanguageCode(value: string): boolean {
  return LanguageCodeSchema.safeParse(value).success;
}

export function validateLanguageCode(value: string, fallback: LanguageCode = "ar"): LanguageCode {
  const parsed = LanguageCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
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
const CountryCodeSchema = z.enum(COUNTRY_CODES);

export function isCountryCode(value: string): boolean {
  return CountryCodeSchema.safeParse(value).success;
}

export function validateCountryCode(value: string, fallback: CountryCode = "SA"): CountryCode {
  const parsed = CountryCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

// Mapping of country codes to display names
export const COUNTRY_NAMES = {
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
} satisfies Record<CountryCode, string>;

// Sorted country list for dropdowns
export const COUNTRY_LIST = COUNTRY_CODES.map((code) => ({
  code,
  name: COUNTRY_NAMES[code],
}));
