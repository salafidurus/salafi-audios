import { useTranslation as useI18nextTranslation } from "react-i18next";

/** Provides the active-locale translator used by native screens and components. */
/** Provides translation state and behavior to native consumers. */
export function useTranslation(namespace?: string) {
  return useI18nextTranslation(namespace ?? "translation");
}
