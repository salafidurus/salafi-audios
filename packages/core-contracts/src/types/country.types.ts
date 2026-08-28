import { z } from "zod";

/** Supported country-code values and validation helpers used by profile and catalog contracts. */
/** Defines the runtime contract value for country codes. */
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

/** Union of country identifiers accepted by profile and catalog contracts. */
export type CountryCode = (typeof COUNTRY_CODES)[number];

/** Runtime validator for the supported country-code allowlist. */
export const CountryCodeSchema = z.enum(COUNTRY_CODES);

/** Reports whether a string is one of the supported country identifiers. */
export function isCountryCode(code: string): code is CountryCode {
  return CountryCodeSchema.safeParse(code).success;
}

/** Returns a supported country identifier, falling back when validation fails. */
export function validateCountryCode(val: string, fallback: CountryCode = "SA"): CountryCode {
  const result = CountryCodeSchema.safeParse(val);
  return result.success ? result.data : fallback;
}

/** Human-readable names for every supported country identifier. */
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

/** Ordered country options for locale-independent selection controls. */
export const COUNTRY_LIST = COUNTRY_CODES.map((code) => ({
  code,
  name: COUNTRY_NAMES[code],
}));
