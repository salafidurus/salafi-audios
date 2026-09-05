/** Documents this module's responsibility and public boundary. */
"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/ui/button";

import type { TranslationEntityConfig, TranslationChildSummary } from "./translation-entities";

import styles from "./translation-modal.module.css";
import { TranslationChildDetail } from "./TranslationChildDetail";

/** Translation state and callbacks for child listing locale editing. */
export interface TranslationChildrenTabProps {
  config: TranslationEntityConfig;
  /** Load lifecycle for the child translation list. */
  status: "idle" | "loading" | "ready" | "error";
  /** Last load/save error displayed above the child fields. */
  error: string | null;
  items: TranslationChildSummary[] | null;
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  onBack: () => void;
  onChildSaved: () => void;
}

function ReadyChildren({
  items,
  onSelectChild,
  t,
}: {
  items: TranslationChildSummary[] | null;
  onSelectChild: (id: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyState}>
        {t("admin.translations.childrenEmpty", "No sub-listings yet")}
      </div>
    );
  }

  return (
    <div className={styles.childrenList}>
      {items.map((child) => (
        <Button
          key={child.id}
          type="button"
          variant="outline"
          fullWidth
          className={[
            styles.childItem,
            child.indent ? styles.childItemIndent : "",
            child.kind === "module" ? styles.childItemModule : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelectChild(child.id)}
        >
          {child.title}
        </Button>
      ))}
    </div>
  );
}

function renderChildrenContent(
  status: TranslationChildrenTabProps["status"],
  error: string | null,
  items: TranslationChildSummary[] | null,
  onSelectChild: (id: string) => void,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (status === "loading") {
    return <div className={styles.loading}>{t("common.loading", "Loading...")}</div>;
  }
  if (status === "error") {
    return (
      <div className={styles.error}>
        {error ?? t("admin.contents.failedToLoad", "Failed to load")}
      </div>
    );
  }
  if (status !== "ready") return null;
  return <ReadyChildren items={items} onSelectChild={onSelectChild} t={t} />;
}

/**
 * The "sub-listings" tab body: a flat list of modules/lessons (list state),
 * or — once one is clicked — that child's own translation editor (detail
 * state, one level of drill-down only).
 */
export function TranslationChildrenTab({
  config,
  status,
  error,
  items,
  selectedChildId,
  onSelectChild,
  onBack,
  onChildSaved,
}: TranslationChildrenTabProps) {
  const { t } = useTranslation();

  if (selectedChildId) {
    return (
      <div className={styles.childrenTab}>
        <TranslationChildDetail
          key={selectedChildId}
          config={config}
          childId={selectedChildId}
          onBack={onBack}
          onSaved={onChildSaved}
        />
      </div>
    );
  }

  return (
    <div className={styles.childrenTab}>
      {renderChildrenContent(status, error, items, onSelectChild, t)}
    </div>
  );
}
