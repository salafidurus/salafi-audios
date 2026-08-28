import { useTranslation as useI18nextTranslation } from "react-i18next";

/** Describes the useTranslation native contract and behavior. */
/** Describes the useTranslation native function contract and behavior. */
export function useTranslation(namespace?: string) {
  return useI18nextTranslation(namespace ?? "translation");
}
