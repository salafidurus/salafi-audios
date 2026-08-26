import { StatusValueSchema, type StatusValue } from "@sd/core-contracts";

// Status type for lectures — sourced from the shared backend contract so the
// web form can't silently drift out of sync with the API's status enum.
export type LectureStatus = StatusValue;

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
