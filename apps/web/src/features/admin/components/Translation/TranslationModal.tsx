/** Documents this module's responsibility and public boundary. */
"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
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
  type TranslationEntityConfig,
  type TranslationChildSummary,
} from "./translation-entities";
import styles from "./translation-modal.module.css";
import { TranslationChildrenTab } from "./TranslationChildrenTab";
import { TranslationLocaleFields } from "./TranslationLocaleFields";
import { TranslationReviewTab } from "./TranslationReviewTab";

/** Controls the translation editor target and its modal lifecycle. */
export interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ClientTranslationTarget | null;
}

function getPublishAction(
  config: TranslationEntityConfig | null,
  state: TranslationFormState,
  locale: Locale,
) {
  if (!config || !config.supportsPublish || !state.entityId) return null;
  const currentlyPublished = state.translationStatus[locale] === "published";
  return {
    action: currentlyPublished ? config.unpublish : config.publish,
    currentlyPublished,
    entityId: state.entityId,
  };
}

function TranslationStatusNotices({
  status,
  entityId,
  error,
  t,
}: {
  /** Current translation-form lifecycle state used to choose notices. */
  status: string;
  entityId?: string | null;
  /** Recoverable load or save failure shown beside the active form. */
  error: string | null;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <>
      {status === "loading" && (
        <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      )}
      {status === "error" && !entityId && (
        <div className={styles.error}>
          {error ?? t("admin.contents.failedToLoad", "Failed to load")}
        </div>
      )}
      {error && status === "ready" && <div className={styles.error}>{error}</div>}
    </>
  );
}

function TranslationModalFooter({
  activeTab,
  saving,
  onClose,
  onReview,
  t,
}: {
  activeTab: string;
  saving: boolean;
  onClose: () => void;
  onReview: () => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
        {t("common.cancel", "Cancel")}
      </Button>
      {activeTab === "review" ? (
        <Button type="submit" form="translation-form" variant="primary" loading={saving}>
          {saving ? t("admin.access.saving", "Saving…") : t("common.save", "Save")}
        </Button>
      ) : (
        <Button type="button" variant="primary" onClick={onReview}>
          {t("admin.modal.reviewTab", "Review")}
        </Button>
      )}
    </DialogFooter>
  );
}

function getTranslationModalTitle(
  sourceTitle: string | null | undefined,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const title = t("admin.translations.title", "Translations");
  return sourceTitle ? `${title} — ${sourceTitle}` : title;
}

function shouldShowChildrenTab(
  config: TranslationEntityConfig | null,
  rootFormat: string | undefined,
  entityId: string | null,
): boolean {
  return Boolean(config?.supportsChildren && rootFormat && rootFormat !== "single" && entityId);
}

type TranslationModalTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  config: TranslationEntityConfig;
  targetEntity: ClientTranslationTarget["entity"];
  /** Current translated values and lifecycle state rendered by each tab. */
  state: TranslationFormState;
  dispatch: React.Dispatch<TranslationFormAction>;
  secondaryLocales: Locale[];
  showChildrenTab: boolean;
  /** Translation tabs containing validation errors. */
  errorTabs: string[];
  /** Loading lifecycle for the optional child-translation list. */
  childrenStatus: "idle" | "loading" | "ready" | "error";
  /** Recoverable child-list loading failure, when present. */
  childrenError: string | null;
  childItems: TranslationChildSummary[] | null;
  selectedChildId: string | null;
  onSelectChild: (id: string | null) => void;
  onPublishToggle: (locale: Locale) => Promise<void>;
  t: ReturnType<typeof useTranslation>["t"];
};

function TranslationModalTabs({
  activeTab,
  onTabChange,
  config,
  targetEntity,
  state,
  dispatch,
  secondaryLocales,
  showChildrenTab,
  errorTabs,
  childrenStatus,
  childrenError,
  childItems,
  selectedChildId,
  onSelectChild,
  onPublishToggle,
  t,
}: TranslationModalTabsProps) {
  const tabs = showChildrenTab
    ? [...secondaryLocales, "children", "review"]
    : [...secondaryLocales, "review"];
  const errorTabSet = new Set(errorTabs);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="min-h-0">
      <TabsList
        className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden"
        aria-label={t("admin.modal.tabsLabel", "Form sections")}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            aria-invalid={errorTabSet.has(tab) || undefined}
            onClick={() => onTabChange(tab)}
          >
            {tab === "children"
              ? t("admin.translations.childrenTab", "Sub-listings")
              : tab === "review"
                ? t("admin.modal.reviewTab", "Review")
                : getLocaleLabel(secondaryLocales.find((locale) => locale === tab) ?? "ar")}
          </TabsTrigger>
        ))}
      </TabsList>
      <TranslationStatusNotices
        status={state.status}
        entityId={state.entityId}
        error={state.error}
        t={t}
      />

      {secondaryLocales.map((locale) => (
        <TabsContent key={locale} value={locale}>
          {state.status === "ready" && (
            <TranslationLocaleFields
              config={config}
              state={state}
              dispatch={dispatch}
              locale={locale}
              idPrefix={`translation-${targetEntity}`}
              onPublishToggle={onPublishToggle}
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
              items={childItems}
              selectedChildId={selectedChildId}
              onSelectChild={onSelectChild}
              onBack={() => onSelectChild(null)}
              onChildSaved={() => onSelectChild(null)}
            />
          )}
        </TabsContent>
      )}

      <TabsContent value="review">
        {state.status === "ready" && (
          <TranslationReviewTab config={config} state={state} secondaryLocales={secondaryLocales} />
        )}
      </TabsContent>
    </Tabs>
  );
}

/** Renders localized fields, child translations, review, and publish controls for one target. */
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

  const showChildrenTab = shouldShowChildrenTab(config, rootFormat, state.entityId);

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
    const request = getPublishAction(config, state, locale);
    if (!request) return;
    const { action, currentlyPublished, entityId } = request;
    if (!action) return;

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const result = await action(entityId, locale);
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
  const modalTitle = getTranslationModalTitle(sourceTitle, t);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !state.saving && handleClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin.modal.formDescription", "Complete each tab before saving.")}
          </DialogDescription>
        </DialogHeader>

        <form
          id="translation-form"
          onSubmit={handleSave}
          className={`${styles.form} min-h-0 flex-1`}
        >
          <TranslationModalTabs
            activeTab={activeTab}
            onTabChange={setActiveTabOverride}
            config={config}
            targetEntity={target.entity}
            state={state}
            dispatch={dispatch}
            secondaryLocales={secondaryLocales}
            showChildrenTab={showChildrenTab}
            errorTabs={errorTabs}
            childrenStatus={childrenStatus}
            childrenError={childrenError}
            childItems={children}
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
            onPublishToggle={handlePublishToggle}
            t={t}
          />

          <TranslationModalFooter
            activeTab={activeTab}
            saving={state.saving}
            onClose={handleClose}
            onReview={() => setActiveTabOverride("review")}
            t={t}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
