import type { ScholarTitle } from "@sd/core-contracts";

import { getScholarTitleLabel, type TranslateFn } from "@sd/core-i18n";
import { QueryClient, QueryClientContext } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

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
 * - formatScholarName({ name: "Salih al-Fawzan", title: "sheikh" }, undefined, t) => "Shaykh Salih al-Fawzan"
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
 * React hook to format a scholar name, resolving the honorific title from
 * the cached scholars list by `scholarSlug` (a locale-independent key), and
 * translating it to the current locale.
 *
 * Matching by slug — not by comparing `scholarName` against the list's
 * locale-resolved names — matters because `scholarName` and the scholars
 * list are fetched independently. Right after a language switch they briefly
 * disagree on which locale they reflect (one may have refetched, the other
 * not yet); text-based matching would fail during that window and silently
 * drop the honorific, or pair a stale-locale name with a fresh-locale list
 * entry that no longer matches it by text at all.
 */
export function useFormattedScholarName(
  scholarName?: string | null,
  scholarSlug?: string | null,
): string {
  const { t } = useTranslation();
  const contextClient = React.useContext(QueryClientContext);
  const hasQueryClient = Boolean(contextClient);
  const shouldFetch = hasQueryClient && Boolean(scholarName) && Boolean(scholarSlug);

  const scholarsQuery = useScholarsList(
    { enabled: shouldFetch },
    contextClient ?? fallbackQueryClient,
  );
  const data = shouldFetch ? scholarsQuery.data : undefined;

  if (!scholarName) return "";

  const foundScholar = scholarSlug
    ? data?.scholars?.find((s) => s.slug === scholarSlug)
    : undefined;

  if (foundScholar?.title) {
    return formatScholarName(scholarName, foundScholar.title, t);
  }

  return scholarName;
}
