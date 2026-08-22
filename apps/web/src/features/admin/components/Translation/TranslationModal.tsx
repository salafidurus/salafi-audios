"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useTranslationForm } from "@/features/admin/hooks/Translation/useTranslationForm";
import { getSecondaryLocales, getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { computeLocalesToSave } from "@/features/admin/utils/translation-save";
import { Modal } from "@/shared/components/ui/modal";

import {
  translationEntities,
  type ClientTranslationTarget,
  type TranslationChildSummary,
} from "./translation-entities";
import styles from "./translation-modal.module.css";
import { TranslationChildrenTab } from "./TranslationChildrenTab";
import { TranslationLocaleFields } from "./TranslationLocaleFields";
import { TranslationReviewTab } from "./TranslationReviewTab";

export interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ClientTranslationTarget | null;
}

export function TranslationModal({ isOpen, onClose, target }: TranslationModalProps) {
  const { t } = useTranslation();
  // Empty until the user picks a tab — falls back to the first secondary locale
  // once loaded, so the modal opens on an editable tab rather than "review".
  const [activeTabOverride, setActiveTabOverride] = useState<string>("");
  const [errorTabs, setErrorTabs] = useState<string[]>([]);
  const loadedRef = useRef(false);

  const { state, dispatch } = useTranslationForm();

  // Only set for listing targets — used to decide whether the "sub-listings" tab
  // is worth showing at all ("single"-format listings have no children).
  const [rootFormat, setRootFormat] = useState<string | undefined>(undefined);
  const [children, setChildren] = useState<TranslationChildSummary[] | null>(null);
  const [childrenStatus, setChildrenStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const childrenLoadedRef = useRef(false);

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
        setRootFormat(data.format);
      })
      .catch((err) => {
        dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
      });
    // config is derived deterministically from target.entity; re-running on target is sufficient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, dispatch]);

  const showChildrenTab =
    !!config?.supportsChildren && !!rootFormat && rootFormat !== "single" && !!state.entityId;

  useEffect(() => {
    const loadChildren = config?.loadChildren;
    if (!showChildrenTab || !loadChildren || !state.entityId || childrenLoadedRef.current) {
      return;
    }
    childrenLoadedRef.current = true;
    setChildrenStatus("loading");
    loadChildren(state.entityId)
      .then((result) => {
        setChildren(result);
        setChildrenStatus("ready");
      })
      .catch((err) => {
        setChildrenError(sanitizeError(err));
        setChildrenStatus("error");
      });
    // config.loadChildren is derived deterministically from target.entity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChildrenTab, state.entityId]);

  if (!target || !config) return null;

  const secondaryLocales = getSecondaryLocales(state.mainLocale);
  const activeTab = activeTabOverride || secondaryLocales[0] || "review";

  const handleClose = () => {
    setErrorTabs([]);
    setActiveTabOverride("");
    setSelectedChildId(null);
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
    const { toSave, errorLocales } = computeLocalesToSave(config, state, secondaryLocales);

    if (errorLocales.length > 0) {
      setErrorTabs(errorLocales);
      dispatch({
        type: "SET_ERROR",
        error: t(
          "admin.translations.requiredFieldMissing",
          "A required field is empty in a locale with other changes.",
        ),
      });
      return;
    }

    if (toSave.size === 0) {
      handleClose();
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await Promise.all(
        Array.from(toSave.entries()).map(async ([locale, fields]) => {
          const result = await config.save(state.entityId!, locale, fields);
          if (result.status) {
            dispatch({ type: "SET_STATUS", locale, status: result.status });
          }
          // Mark this locale's initial state with the saved fields so that
          // canPublish becomes true immediately — no close/reopen needed.
          dispatch({ type: "MARK_INITIAL", locale, fields });
        }),
      );
      // Do NOT call handleClose() here. The modal stays open so the user can
      // immediately click Publish for the locale they just saved.
      // They can close manually via the X button when done.
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
          {showChildrenTab && (
            <Modal.TabItem id="children">
              {t("admin.translations.childrenTab", "Sub-listings")}
            </Modal.TabItem>
          )}
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
              return (
                <TranslationLocaleFields
                  key={locale}
                  config={config}
                  state={state}
                  dispatch={dispatch}
                  locale={locale}
                  idPrefix={`translation-${target.entity}`}
                  onPublishToggle={handlePublishToggle}
                />
              );
            })}

            {showChildrenTab && activeTab === "children" && (
              <TranslationChildrenTab
                config={config}
                status={childrenStatus}
                error={childrenError}
                items={children}
                selectedChildId={selectedChildId}
                onSelectChild={setSelectedChildId}
                onBack={() => setSelectedChildId(null)}
                onChildSaved={() => setSelectedChildId(null)}
              />
            )}

            {activeTab === "review" && (
              <TranslationReviewTab
                config={config}
                state={state}
                secondaryLocales={secondaryLocales}
              />
            )}
          </>
        )}
      </form>
    </Modal>
  );
}
