"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { useTranslation } from "@/core/i18n/use-translation";
import { PermissionGate } from "@/features/admin/components/Content/Users/permission-gate/permission-gate";
import { getSecondaryLocales, getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import {
  useTranslationForm,
  getFieldValue,
  isLocaleDirty,
  type TranslationFormState,
} from "@/features/admin/hooks/Translation/useTranslationForm";
import { translationEntities, type ClientTranslationTarget } from "./translation-entities";
import { TranslationFieldRow } from "./TranslationFieldRow";
import styles from "./translation-modal.module.css";

export interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ClientTranslationTarget | null;
}

type StatusDot = "published" | "draft" | "notCreated";

const STATUS_DOT_CLASS: Record<StatusDot, string> = {
  published: styles.dotPublished ?? "",
  draft: styles.dotDraft ?? "",
  notCreated: styles.dotNotCreated ?? "",
};

function statusInfo(
  state: TranslationFormState,
  locale: Locale,
  supportsPublish: boolean,
  t: (key: string, fallback: string) => string,
): { label: string; dot: StatusDot } {
  const hasTranslation = !!state.initial[locale];
  if (!supportsPublish) {
    return hasTranslation
      ? { label: t("admin.translations.status.saved", "Saved"), dot: "published" }
      : { label: t("admin.translations.status.notCreated", "Not created"), dot: "notCreated" };
  }
  const status = state.translationStatus[locale];
  if (status === "published") {
    return { label: t("admin.translations.status.published", "Published"), dot: "published" };
  }
  if (status === "draft") {
    return { label: t("admin.translations.status.draft", "Draft"), dot: "draft" };
  }
  return { label: t("admin.translations.status.notCreated", "Not created"), dot: "notCreated" };
}

export function TranslationModal({ isOpen, onClose, target }: TranslationModalProps) {
  const { t } = useTranslation();
  // Empty until the user picks a tab — falls back to the first secondary locale
  // once loaded, so the modal opens on an editable tab rather than "review".
  const [activeTabOverride, setActiveTabOverride] = useState<string>("");
  const [errorTabs, setErrorTabs] = useState<string[]>([]);
  const loadedRef = useRef(false);

  const { state, dispatch } = useTranslationForm();

  const config = target ? translationEntities[target.entity] : null;

  useEffect(() => {
    if (!target || !config || loadedRef.current) return;
    loadedRef.current = true;
    config
      .load(target)
      .then((data) => {
        dispatch({
          type: "INIT",
          entityId: data.entityId,
          mainLocale: data.mainLocale,
          source: data.source,
          translations: data.translations,
        });
      })
      .catch((err) => {
        dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
      });
    // config is derived deterministically from target.entity; re-running on target is sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, dispatch]);

  if (!target || !config) return null;

  const secondaryLocales = getSecondaryLocales(state.mainLocale);
  const activeTab = activeTabOverride || secondaryLocales[0] || "review";

  const handleClose = () => {
    setErrorTabs([]);
    setActiveTabOverride("");
    onClose();
  };

  async function handlePublishToggle(locale: Locale) {
    // Closures defined after the early return above don't retain TypeScript's
    // null-narrowing of `config`, so it's re-checked here.
    if (!config || !config.supportsPublish || !state.entityId) return;
    const currentlyPublished = state.translationStatus[locale] === "published";
    const action = currentlyPublished ? config.unpublish : config.publish;
    if (!action) return;

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const result = await action(state.entityId, locale);
      dispatch({
        type: "SET_STATUS",
        locale,
        status: result.status ?? (currentlyPublished ? "draft" : "published"),
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config || !state.entityId) return;

    setErrorTabs([]);
    const errTabs: string[] = [];
    const localesToSave: Locale[] = [];
    const fieldsByLocale = new Map<Locale, Record<string, string>>();

    for (const locale of secondaryLocales) {
      if (!isLocaleDirty(state, locale)) continue;

      const merged: Record<string, string> = {};
      let hasContent = false;
      let missingRequired = false;
      for (const field of config.fields) {
        const value = getFieldValue(state, locale, field.key);
        merged[field.key] = value;
        if (value.trim()) hasContent = true;
        if (field.required && !value.trim()) missingRequired = true;
      }

      if (missingRequired && hasContent) {
        errTabs.push(locale);
        continue;
      }
      if (missingRequired && !hasContent) continue; // fully cleared — nothing to persist

      localesToSave.push(locale);
      fieldsByLocale.set(locale, merged);
    }

    if (errTabs.length > 0) {
      setErrorTabs(errTabs);
      dispatch({
        type: "SET_ERROR",
        error: t(
          "admin.translations.requiredFieldMissing",
          "A required field is empty in a locale with other changes.",
        ),
      });
      return;
    }

    if (localesToSave.length === 0) {
      handleClose();
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await Promise.all(
        localesToSave.map(async (locale) => {
          const fields = fieldsByLocale.get(locale)!;
          const result = await config.save(state.entityId!, locale, fields);
          if (result.status) {
            dispatch({ type: "SET_STATUS", locale, status: result.status });
          }
        }),
      );
      handleClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  }

  const titleField = config.fields[0];
  const sourceTitle = titleField ? state.source[titleField.key] : undefined;
  const modalTitle = sourceTitle
    ? `${t("admin.translations.title", "Translations")} — ${sourceTitle}`
    : t("admin.translations.title", "Translations");

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="xl"
      width="wide"
      height="long"
      multiTab
      requireReview
      errorTabs={errorTabs}
      activeTab={activeTab}
      onActiveTabChange={setActiveTabOverride}
      saveFormId="translation-form"
      saving={state.saving}
      reviewTabId="review"
    >
      <form id="translation-form" onSubmit={handleSave} className={styles.form}>
        <Modal.Tabs errorTabs={errorTabs}>
          {secondaryLocales.map((locale) => (
            <Modal.TabItem key={locale} id={locale}>
              {getLocaleLabel(locale)}
            </Modal.TabItem>
          ))}
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        {state.status === "loading" && (
          <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
        )}

        {state.status === "error" && !state.entityId && (
          <div className={styles.error}>
            {state.error ?? t("admin.contents.failedToLoad", "Failed to load")}
          </div>
        )}

        {state.status === "ready" && (
          <>
            {state.error && <div className={styles.error}>{state.error}</div>}

            {secondaryLocales.map((locale) => {
              if (activeTab !== locale) return null;
              const { label, dot } = statusInfo(state, locale, config.supportsPublish, t);
              const dotClass = STATUS_DOT_CLASS[dot];
              const dirty = isLocaleDirty(state, locale);
              const canPublish = !dirty && !!state.initial[locale];
              const isPublished = state.translationStatus[locale] === "published";

              return (
                <div key={locale} className={styles.localeTab}>
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
                          onClick={() => handlePublishToggle(locale)}
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
                      id={`translation-${target.entity}-${locale}-${field.key}`}
                      label={t(field.labelKey, field.fallbackLabel)}
                      sourceValue={state.source[field.key] ?? null}
                      value={getFieldValue(state, locale, field.key)}
                      required={field.required}
                      multiline={field.multiline}
                      onChange={(value) =>
                        dispatch({ type: "EDIT_FIELD", locale, field: field.key, value })
                      }
                    />
                  ))}
                </div>
              );
            })}

            {activeTab === "review" && (
              <div className={styles.reviewTab}>
                {secondaryLocales.every((locale) => !isLocaleDirty(state, locale)) ? (
                  <div className={styles.emptyState}>
                    {t("admin.scholars.noChangesMadeYet", "No changes made yet")}
                  </div>
                ) : (
                  secondaryLocales.map((locale) => {
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
                  })
                )}
              </div>
            )}
          </>
        )}
      </form>
    </Modal>
  );
}
