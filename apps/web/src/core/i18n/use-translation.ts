/** Exposes the web translation hook with the web namespace selected by default. */
"use client";

import { useTranslation as useI18nextTranslation } from "react-i18next";

/** Returns the app translation hook with the web translation namespace as its default. */
export function useTranslation(namespace?: string) {
  return useI18nextTranslation(namespace ?? "translation");
}
