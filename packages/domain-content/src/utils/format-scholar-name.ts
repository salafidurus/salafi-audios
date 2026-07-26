import React, { useCallback } from "react";
import type { ScholarTitle } from "@sd/core-contracts";
import { getScholarTitleLabel, type TranslateFn } from "@sd/core-i18n";
import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientContext } from "@tanstack/react-query";
import { useScholarsList } from "../scholar.api";

export interface ScholarWithNameAndTitle {
  name: string;
  title?: ScholarTitle | string | null;
}

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: false,
    },
  },
});

/**
 * Format a scholar's name with their honorific title prefix, translated via
 * the given `t` function so the honorific follows the active locale. This is
 * the low-level, non-hook utility — components should prefer the
 * `useFormatScholarName`/`useFormattedScholarName` hooks below, which supply
 * `t` automatically via `useTranslation()`.
 *
 * Examples:
 * - formatScholarName({ name: "Salih al-Fawzan", title: "sheikh" }, undefined, t) => "Sheikh Salih al-Fawzan"
 * - formatScholarName("Muhammad Nasiruddin al-Albani", "allamah", t) => "Shaykh Allamah Muhammad Nasiruddin al-Albani"
 */
export function formatScholarName(
  scholar: ScholarWithNameAndTitle | string | null | undefined,
  titleParam: ScholarTitle | string | null | undefined,
  t: TranslateFn,
): string {
  if (!scholar) return "";

  const name = typeof scholar === "string" ? scholar : scholar.name;
  const title = typeof scholar === "string" ? titleParam : scholar.title;

  if (!name) return "";
  if (!title) return name;

  const prefix = getScholarTitleLabel(title, t);
  if (!prefix) return name;

  if (name.startsWith(prefix)) return name;

  return `${prefix} ${name}`;
}

/**
 * React hook returning a `formatScholarName`-shaped function bound to the
 * current locale's translations, so call sites don't need to obtain and pass
 * `t` themselves.
 */
export function useFormatScholarName(): (
  scholar: ScholarWithNameAndTitle | string | null | undefined,
  titleParam?: ScholarTitle | string | null,
) => string {
  const { t } = useTranslation();
  return useCallback((scholar, titleParam) => formatScholarName(scholar, titleParam, t), [t]);
}

/**
 * React hook to format a scholar name, resolving title from cache if
 * omitted, and translating the honorific to the current locale.
 */
export function useFormattedScholarName(
  scholarName?: string | null,
  titleParam?: ScholarTitle | string | null,
): string {
  const { t } = useTranslation();
  const contextClient = React.useContext(QueryClientContext);
  const hasQueryClient = Boolean(contextClient);
  const shouldFetch = hasQueryClient && Boolean(scholarName) && !titleParam;

  const scholarsQuery = useScholarsList(
    { enabled: shouldFetch },
    contextClient ?? fallbackQueryClient,
  );
  const data = shouldFetch ? scholarsQuery.data : undefined;

  if (!scholarName) return "";

  if (titleParam) {
    return formatScholarName(scholarName, titleParam, t);
  }

  const foundScholar = data?.scholars?.find(
    (s) => s.name === scholarName || formatScholarName(s.name, s.title, t) === scholarName,
  );

  if (foundScholar?.title) {
    return formatScholarName(scholarName, foundScholar.title, t);
  }

  return scholarName;
}
