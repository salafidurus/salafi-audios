"use client";

import { useTranslation as useI18nextTranslation } from "react-i18next";

export function useTranslation(namespace?: string) {
  return useI18nextTranslation(namespace ?? "translation");
}

export { i18next } from "./i18n";
