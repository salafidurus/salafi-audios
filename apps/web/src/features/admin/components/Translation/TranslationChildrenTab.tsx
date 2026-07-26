"use client";

import { Button } from "@/shared/components/Button";
import { useTranslation } from "@/core/i18n/use-translation";
import type { TranslationEntityConfig, TranslationChildSummary } from "./translation-entities";
import { TranslationChildDetail } from "./TranslationChildDetail";
import styles from "./translation-modal.module.css";

export interface TranslationChildrenTabProps {
  config: TranslationEntityConfig;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  items: TranslationChildSummary[] | null;
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  onBack: () => void;
  onChildSaved: () => void;
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
      {status === "loading" && (
        <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      )}
      {status === "error" && (
        <div className={styles.error}>
          {error ?? t("admin.contents.failedToLoad", "Failed to load")}
        </div>
      )}
      {status === "ready" && (!items || items.length === 0) && (
        <div className={styles.emptyState}>
          {t("admin.translations.childrenEmpty", "No sub-listings yet")}
        </div>
      )}
      {status === "ready" && items && items.length > 0 && (
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
      )}
    </div>
  );
}
