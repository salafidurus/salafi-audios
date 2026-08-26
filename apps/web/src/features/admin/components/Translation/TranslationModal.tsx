"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useTranslationForm } from "@/features/admin/hooks/Translation/useTranslationForm";
import { getSecondaryLocales, getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { computeLocalesToSave } from "@/features/admin/utils/translation-save";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

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
  const errorTabSet = new Set(errorTabs);

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !state.saving && handleClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin.modal.formDescription", "Complete each tab before saving.")}
          </DialogDescription>
        </DialogHeader>

        <form id="translation-form" onSubmit={handleSave} className={styles.form}>
          <Tabs value={activeTab} onValueChange={setActiveTabOverride} className="min-h-0">
            <TabsList
              className="w-full justify-start overflow-x-auto"
              aria-label={t("admin.modal.tabsLabel", "Form sections")}
            >
              {secondaryLocales.map((locale) => (
                <TabsTrigger
                  key={locale}
                  value={locale}
                  aria-invalid={errorTabSet.has(locale) || undefined}
                  onClick={() => setActiveTabOverride(locale)}
                >
                  {getLocaleLabel(locale)}
                </TabsTrigger>
              ))}
              {showChildrenTab && (
                <TabsTrigger value="children" onClick={() => setActiveTabOverride("children")}>
                  {t("admin.translations.childrenTab", "Sub-listings")}
                </TabsTrigger>
              )}
              <TabsTrigger value="review" onClick={() => setActiveTabOverride("review")}>
                {t("admin.modal.reviewTab", "Review")}
              </TabsTrigger>
            </TabsList>
            {state.status === "loading" && (
              <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
            )}

            {state.status === "error" && !state.entityId && (
              <div className={styles.error}>
                {state.error ?? t("admin.contents.failedToLoad", "Failed to load")}
              </div>
            )}

            {state.error && state.status === "ready" && (
              <div className={styles.error}>{state.error}</div>
            )}

            {secondaryLocales.map((locale) => (
              <TabsContent key={locale} value={locale}>
                {state.status === "ready" && (
                  <TranslationLocaleFields
                    config={config}
                    state={state}
                    dispatch={dispatch}
                    locale={locale}
                    idPrefix={`translation-${target.entity}`}
                    onPublishToggle={handlePublishToggle}
                  />
                )}
              </TabsContent>
            ))}

            {showChildrenTab && (
              <TabsContent value="children">
                {state.status === "ready" && (
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
              </TabsContent>
            )}

            <TabsContent value="review">
              {state.status === "ready" && (
                <TranslationReviewTab
                  config={config}
                  state={state}
                  secondaryLocales={secondaryLocales}
                />
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleClose} disabled={state.saving}>
              {t("common.cancel", "Cancel")}
            </Button>
            {activeTab === "review" ? (
              <Button
                type="submit"
                form="translation-form"
                variant="primary"
                loading={state.saving}
              >
                {state.saving ? t("admin.access.saving", "Saving…") : t("common.save", "Save")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => setActiveTabOverride("review")}
              >
                {t("admin.modal.reviewTab", "Review")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
