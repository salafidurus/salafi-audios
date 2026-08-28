/** Documents this module's responsibility and public boundary. */
"use client";

import { useTranslation as useI18nextTranslation } from "react-i18next";

/** Documents the intent and contract of this declaration. */
export function useTranslation(namespace?: string) {
  return useI18nextTranslation(namespace ?? "translation");
}
