"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  useTranslationForm,
  type TranslationFormAction,
  type TranslationFormState,
} from "@/features/admin/hooks/Translation/useTranslationForm";
import { getSecondaryLocales, getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { computeLocalesToSave } from "@/features/admin/utils/translation-save";
import { Button } from "@/shared/components/ui/button";

import type { TranslationEntityConfig } from "./translation-entities";

import styles from "./translation-modal.module.css";
import { TranslationLocaleFields } from "./TranslationLocaleFields";

export interface TranslationChildDetailProps {
  config: TranslationEntityConfig;
  childId: string;
  onBack: () => void;
  /** Called after a successful save — the parent returns to the sub-listings list. */
  onSaved: () => void;
}

interface TranslationChildDetailViewProps {
  config: TranslationEntityConfig;
  childId: string;
  state: TranslationFormState;
  dispatch: React.Dispatch<TranslationFormAction>;
  locale: Locale | null;
  secondaryLocales: Locale[];
  onBack: () => void;
  onSave: () => void;
  onPublishToggle: (locale: Locale) => Promise<void>;
  onLocaleChange: (locale: Locale) => void;
}

interface TranslationChildReadyViewProps {
  config: TranslationEntityConfig;
  childId: string;
  state: TranslationFormState;
  dispatch: React.Dispatch<TranslationFormAction>;
  locale: Locale;
  secondaryLocales: Locale[];
  onSave: () => void;
  onPublishToggle: (locale: Locale) => Promise<void>;
  onLocaleChange: (locale: Locale) => void;
}

function TranslationChildReadyView({
  config,
  childId,
  state,
  dispatch,
  locale,
  secondaryLocales,
  onSave,
  onPublishToggle,
  onLocaleChange,
}: TranslationChildReadyViewProps) {
  const { t } = useTranslation();

  return (
    <>
      {state.error && <div className={styles.error}>{state.error}</div>}

      {secondaryLocales.length > 1 && (
        <div className={styles.childLocaleTabs}>
          {secondaryLocales.map((loc) => (
            <Button
              key={loc}
              type="button"
              variant={locale === loc ? "secondary" : "ghost"}
              size="sm"
              className={styles.childLocaleTabButton}
              onClick={() => onLocaleChange(loc)}
            >
              {getLocaleLabel(loc)}
            </Button>
          ))}
        </div>
      )}

      <TranslationLocaleFields
        config={config}
        state={state}
        dispatch={dispatch}
        locale={locale}
        idPrefix={`translation-child-${childId}`}
        onPublishToggle={onPublishToggle}
      />

      <div className={styles.childDetailActions}>
        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={state.saving}
          disabled={state.saving}
          onClick={onSave}
        >
          {state.saving ? t("admin.access.saving", "Saving…") : t("common.save", "Save")}
        </Button>
      </div>
    </>
  );
}

function TranslationChildDetailView({
  config,
  childId,
  state,
  dispatch,
  locale,
  secondaryLocales,
  onBack,
  onSave,
  onPublishToggle,
  onLocaleChange,
}: TranslationChildDetailViewProps) {
  const { t } = useTranslation();
  const titleField = config.fields[0];
  const sourceTitle = titleField ? state.source[titleField.key] : undefined;

  return (
    <div className={styles.childDetail}>
      <div className={styles.backRow}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
        >
          {t("common.back", "Back")}
        </Button>
        {sourceTitle && <span className={styles.childDetailTitle}>{sourceTitle}</span>}
      </div>

      {state.status === "loading" && (
        <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      )}

      {state.status === "error" && !state.entityId && (
        <div className={styles.error}>
          {state.error ?? t("admin.contents.failedToLoad", "Failed to load")}
        </div>
      )}

      {state.status === "ready" && locale && (
        <TranslationChildReadyView
          config={config}
          childId={childId}
          state={state}
          dispatch={dispatch}
          locale={locale}
          secondaryLocales={secondaryLocales}
          onSave={onSave}
          onPublishToggle={onPublishToggle}
          onLocaleChange={onLocaleChange}
        />
      )}
    </div>
  );
}

/**
 * One level of drill-down from the "sub-listings" tab: edits a single child
 * listing's (module or lesson) translations, reusing the same load/save/
 * publish plumbing as the root listing's own locale tabs. Deliberately does
 * not offer its own "sub-listings" tab — no further nesting.
 */
export function TranslationChildDetail({
  config,
  childId,
  onBack,
  onSaved,
}: TranslationChildDetailProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useTranslationForm();
  const [activeLocale, setActiveLocale] = useState<Locale | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    config
      .load({ entity: "listing", listingId: childId })
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
    // config/childId are fixed for the lifetime of this component (remounted via `key`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const secondaryLocales = getSecondaryLocales(state.mainLocale);
  const locale = activeLocale ?? secondaryLocales[0] ?? null;

  async function handlePublishToggle(targetLocale: Locale) {
    if (!config.supportsPublish || !state.entityId) return;
    const currentlyPublished = state.translationStatus[targetLocale] === "published";
    const action = currentlyPublished ? config.unpublish : config.publish;
    if (!action) return;

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const result = await action(state.entityId, targetLocale);
      dispatch({
        type: "SET_STATUS",
        locale: targetLocale,
        status: result.status ?? (currentlyPublished ? "draft" : "published"),
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  }

  async function handleSave() {
    if (!state.entityId) return;
    const { toSave, errorLocales } = computeLocalesToSave(config, state, secondaryLocales);

    if (errorLocales.length > 0) {
      dispatch({
        type: "SET_ERROR",
        error: t(
          "admin.translations.requiredFieldMissing",
          "A required field is empty in a locale with other changes.",
        ),
      });
      if (errorLocales[0]) setActiveLocale(errorLocales[0]);
      return;
    }

    if (toSave.size === 0) {
      onSaved();
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await Promise.all(
        Array.from(toSave.entries()).map(async ([saveLocale, fields]) => {
          const result = await config.save(state.entityId!, saveLocale, fields);
          if (result.status) {
            dispatch({ type: "SET_STATUS", locale: saveLocale, status: result.status });
          }
        }),
      );
      onSaved();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  }

  return (
    <TranslationChildDetailView
      config={config}
      childId={childId}
      state={state}
      dispatch={dispatch}
      locale={locale}
      secondaryLocales={secondaryLocales}
      onBack={onBack}
      onSave={handleSave}
      onPublishToggle={handlePublishToggle}
      onLocaleChange={setActiveLocale}
    />
  );
}
