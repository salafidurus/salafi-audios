"use client";

import type { Locale } from "@sd/core-contracts";

import type { TranslationFormState } from "@/features/admin/hooks/Translation/useTranslationForm";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  getFieldValue,
  isLocaleDirty,
} from "@/features/admin/hooks/Translation/useTranslationForm";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";

import type { TranslationEntityConfig } from "./translation-entities";

import styles from "./translation-modal.module.css";

export interface TranslationReviewTabProps {
  config: TranslationEntityConfig;
  state: TranslationFormState;
  secondaryLocales: Locale[];
}

/** Diffs every dirty locale's fields against their last-saved values. */
export function TranslationReviewTab({
  config,
  state,
  secondaryLocales,
}: TranslationReviewTabProps) {
  const { t } = useTranslation();

  if (secondaryLocales.every((locale) => !isLocaleDirty(state, locale))) {
    return (
      <div className={styles.reviewTab}>
        <div className={styles.emptyState}>
          {t("admin.scholars.noChangesMadeYet", "No changes made yet")}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reviewTab}>
      {secondaryLocales.map((locale) => {
        if (!isLocaleDirty(state, locale)) return null;
        return (
          <div key={locale} className={styles.reviewLocaleBlock}>
            <h4 className={styles.reviewLocaleTitle}>{getLocaleLabel(locale)}</h4>
            {config.fields.map((field) => {
              const oldValue = state.initial[locale]?.[field.key] ?? "";
              const newValue = getFieldValue(state, locale, field.key);
              if (oldValue === newValue) return null;
              return (
                <div key={field.key} className={styles.reviewFieldDiff}>
                  <strong>{t(field.labelKey, field.fallbackLabel)}:</strong>
                  <span className={styles.diffOld}>{oldValue || "—"}</span>
                  {" → "}
                  <span className={styles.diffNew}>{newValue || "—"}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
