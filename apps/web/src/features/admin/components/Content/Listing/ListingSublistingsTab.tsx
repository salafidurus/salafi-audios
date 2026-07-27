"use client";

import { sanitizeError } from "@sd/utils-error";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchArrangeData } from "@/features/admin/api/admin-lectures.api";
import { Button } from "@/shared/components/Button";

import styles from "./listing-modal.module.css";
import { ListingSublistingDetail } from "./ListingSublistingDetail";

export interface ListingSublistingsTabProps {
  rootListingId: string;
}

interface ChildSummary {
  id: string;
  title: string;
  kind: "module" | "lesson";
  indent: boolean;
}

interface TabState {
  status: "loading" | "ready" | "error";
  error: string | null;
  items: ChildSummary[];
}

/**
 * The listing modal's "Sub-listings" tab: a flat list of a series/collection's
 * modules/lessons (list state), or — once one is clicked — that child's own
 * title/description/status/orderIndex editor (detail state, one level of
 * drill-down only). Modules/lessons are Listing rows themselves, so the
 * detail editor reuses the same generic form-data/update-details endpoints
 * as the root listing modal.
 */
export function ListingSublistingsTab({ rootListingId }: ListingSublistingsTabProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<TabState>({ status: "loading", error: null, items: [] });
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const loadedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedForRef.current === rootListingId) return;
    loadedForRef.current = rootListingId;
    setState({ status: "loading", error: null, items: [] });
    fetchArrangeData(rootListingId)
      .then((data) => {
        const items: ChildSummary[] = data.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          kind: "lesson" as const,
          indent: false,
        }));
        for (const mod of data.modules) {
          items.push({ id: mod.id, title: mod.title, kind: "module", indent: false });
          for (const lesson of mod.lessons) {
            items.push({ id: lesson.id, title: lesson.title, kind: "lesson", indent: true });
          }
        }
        setState({ status: "ready", error: null, items });
      })
      .catch((err) => {
        setState({ status: "error", error: sanitizeError(err), items: [] });
      });
  }, [rootListingId]);

  if (selectedChildId) {
    return (
      <div className={styles.childrenTab}>
        <ListingSublistingDetail
          key={selectedChildId}
          childId={selectedChildId}
          onBack={() => setSelectedChildId(null)}
          onSaved={() => setSelectedChildId(null)}
        />
      </div>
    );
  }

  return (
    <div className={styles.childrenTab}>
      {state.status === "loading" && (
        <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      )}
      {state.status === "error" && (
        <div className={styles.error}>
          {state.error ?? t("admin.contents.failedToLoad", "Failed to load")}
        </div>
      )}
      {state.status === "ready" && state.items.length === 0 && (
        <div className={styles.emptyState}>
          {t("admin.translations.childrenEmpty", "No sub-listings yet")}
        </div>
      )}
      {state.status === "ready" && state.items.length > 0 && (
        <div className={styles.childrenList}>
          {state.items.map((child) => (
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
              onClick={() => setSelectedChildId(child.id)}
            >
              {child.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
