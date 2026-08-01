import { z } from "zod";

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

export const CountryCodeSchema = z.enum(COUNTRY_CODES);

export function isCountryCode(val: unknown): val is CountryCode {
  return CountryCodeSchema.safeParse(val).success;
}

export function validateCountryCode(val: string, fallback: CountryCode = "SA"): CountryCode {
  const result = CountryCodeSchema.safeParse(val);
  return result.success ? result.data : fallback;
}

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

export const COUNTRY_LIST = Object.entries(COUNTRY_NAMES).map(([code, name]) => ({
  code: code as CountryCode,
  name,
}));
