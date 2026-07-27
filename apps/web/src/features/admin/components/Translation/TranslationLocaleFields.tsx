"use client";

import type { Locale } from "@sd/core-contracts";

import { useTranslation } from "@/core/i18n/use-translation";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import {
  getFieldValue,
  isLocaleDirty,
  type TranslationFormAction,
  type TranslationFormState,
} from "@/features/admin/hooks/Translation/useTranslationForm";
import { Button } from "@/shared/components/Button";

import type { TranslationEntityConfig } from "./translation-entities";

import styles from "./translation-modal.module.css";
import { statusInfo, type StatusDot } from "./translation-status";
import { TranslationFieldRow } from "./TranslationFieldRow";

const STATUS_DOT_CLASS: Record<StatusDot, string> = {
  published: styles.dotPublished ?? "",
  draft: styles.dotDraft ?? "",
  notCreated: styles.dotNotCreated ?? "",
};

export interface TranslationLocaleFieldsProps {
  config: TranslationEntityConfig;
  state: TranslationFormState;
  dispatch: React.Dispatch<TranslationFormAction>;
  locale: Locale;
  /** Unique per-instance prefix for field DOM ids (root vs. a given child). */
  idPrefix: string;
  onPublishToggle: (locale: Locale) => void;
}

/**
 * One locale's editable fields + status chip + publish/unpublish button.
 * Shared by the root listing/scholar/topic locale tabs and the translation
 * modal's sub-listing child detail view.
 */
export function TranslationLocaleFields({
  config,
  state,
  dispatch,
  locale,
  idPrefix,
  onPublishToggle,
}: TranslationLocaleFieldsProps) {
  const { t } = useTranslation();
  const { label, dot } = statusInfo(state, locale, config.supportsPublish, t);
  const dotClass = STATUS_DOT_CLASS[dot];
  const dirty = isLocaleDirty(state, locale);
  const canPublish = !dirty && !!state.initial[locale];
  const isPublished = state.translationStatus[locale] === "published";

  return (
    <div className={styles.localeTab}>
      <div className={styles.statusRow}>
        <span className={styles.statusChip}>
          <span className={`${styles.statusDot} ${dotClass}`} />
          {label}
        </span>
        {config.supportsPublish && (
          <PermissionGate requires="TRANSLATIONS_PUBLISH">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPublish || state.saving}
              loading={state.saving}
              title={
                dirty
                  ? t("admin.translations.saveBeforePublish", "Save before publishing")
                  : undefined
              }
              onClick={() => onPublishToggle(locale)}
            >
              {isPublished
                ? t("admin.translations.unpublish", "Unpublish")
                : t("admin.translations.publish", "Publish")}
            </Button>
          </PermissionGate>
        )}
      </div>

      {config.fields.map((field) => (
        <TranslationFieldRow
          key={field.key}
          id={`${idPrefix}-${locale}-${field.key}`}
          label={t(field.labelKey, field.fallbackLabel)}
          sourceValue={state.source[field.key] ?? null}
          value={getFieldValue(state, locale, field.key)}
          required={field.required}
          multiline={field.multiline}
          onChange={(value) => dispatch({ type: "EDIT_FIELD", locale, field: field.key, value })}
        />
      ))}
    </div>
  );
}
