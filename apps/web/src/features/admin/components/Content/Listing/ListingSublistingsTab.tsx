"use client";

import { sanitizeError } from "@sd/utils-error";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchArrangeData, updateListingDetails } from "@/features/admin/api/admin-lectures.api";
import { Button } from "@/shared/components/ui/button";

import styles from "./listing-modal.module.css";
import { ListingSublistingDetail } from "./ListingSublistingDetail";

export interface ListingSublistingsTabProps {
  rootListingId: string;
}

interface LessonSummary {
  id: string;
  title: string;
}

interface ModuleGroup {
  id: string;
  title: string;
  lessons: LessonSummary[];
}

interface TabData {
  modules: ModuleGroup[];
  topLevelLessons: LessonSummary[];
  /** All child IDs (modules + all their lessons + top-level lessons) */
  allChildIds: string[];
}

interface TabState {
  status: "loading" | "ready" | "error";
  error: string | null;
  data: TabData;
}

const EMPTY_DATA: TabData = { modules: [], topLevelLessons: [], allChildIds: [] };

function hasChildren(data: TabData) {
  return data.modules.length > 0 || data.topLevelLessons.length > 0;
}

function renderTabStatus(
  state: TabState,
  containsChildren: boolean,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (state.status === "loading") {
    return <div className={styles.loading}>{t("common.loading", "Loading...")}</div>;
  }
  if (state.status === "error") {
    return (
      <div className={styles.error}>
        {state.error ?? t("admin.contents.failedToLoad", "Failed to load")}
      </div>
    );
  }
  if (!containsChildren) {
    return (
      <div className={styles.emptyState}>
        {t("admin.translations.childrenEmpty", "No sub-listings yet")}
      </div>
    );
  }
  return null;
}

/**
 * The listing modal's "Sub-listings" tab: lists modules + lessons with an
 * accordion for modules, bulk Publish All / Draft All buttons, and a
 * drill-down detail editor for any child.
 */
export function ListingSublistingsTab({ rootListingId }: ListingSublistingsTabProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<TabState>({
    status: "loading",
    error: null,
    data: EMPTY_DATA,
  });
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  /** Which module's lesson list is expanded (one at a time). */
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const loadedForRef = useRef<string | null>(null);

  const fetchData = useCallback(() => {
    // This resets state ahead of an async fetch (fetchArrangeData) keyed off
    // rootListingId, guarded by loadedForRef below to avoid duplicate fetches
    // — not a synchronous state mirror, so key-remount / derive-during-render
    // fixes don't apply here.
    // react-doctor-disable-next-line react-doctor/no-adjust-state-on-prop-change
    setState((s) => ({ ...s, status: "loading", error: null }));
    fetchArrangeData(rootListingId)
      .then((data) => {
        const modules: ModuleGroup[] = data.modules.map((mod) => ({
          id: mod.id,
          title: mod.title,
          lessons: mod.lessons.map((l) => ({ id: l.id, title: l.title })),
        }));
        const topLevelLessons: LessonSummary[] = data.lessons.map((l) => ({
          id: l.id,
          title: l.title,
        }));
        const allChildIds: string[] = [
          ...topLevelLessons.map((l) => l.id),
          ...modules.flatMap((m) => [m.id, ...m.lessons.map((l) => l.id)]),
        ];
        setState({ status: "ready", error: null, data: { modules, topLevelLessons, allChildIds } });
      })
      .catch((err) => {
        setState({ status: "error", error: sanitizeError(err), data: EMPTY_DATA });
      });
  }, [rootListingId]);

  useEffect(() => {
    if (loadedForRef.current === rootListingId) return;
    loadedForRef.current = rootListingId;
    fetchData();
  }, [rootListingId, fetchData]);

  const handleBulkStatus = async (status: "published" | "draft") => {
    setBulkLoading(true);
    setBulkError(null);
    try {
      await Promise.all(state.data.allChildIds.map((id) => updateListingDetails(id, { status })));
      fetchData();
    } catch (err) {
      setBulkError(sanitizeError(err));
    } finally {
      setBulkLoading(false);
    }
  };

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

  const { data } = state;
  const containsChildren = hasChildren(data);

  return (
    <div className={styles.childrenTab}>
      {renderTabStatus(state, containsChildren, t)}
      {state.status === "ready" && containsChildren && (
        <>
          {/* Bulk actions */}
          <div className={styles.bulkActions}>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              onClick={() => handleBulkStatus("published")}
            >
              {t("admin.contents.listing.publishAll", "Publish All")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              onClick={() => handleBulkStatus("draft")}
            >
              {t("admin.contents.listing.draftAll", "Draft All")}
            </Button>
          </div>
          {bulkError && <div className={styles.error}>{bulkError}</div>}

          <div className={styles.childrenList}>
            {/* Top-level lessons */}
            {data.topLevelLessons.map((lesson) => (
              <Button
                key={lesson.id}
                type="button"
                variant="outline"
                fullWidth
                className={styles.childItem}
                onClick={() => setSelectedChildId(lesson.id)}
              >
                {lesson.title}
              </Button>
            ))}

            {/* Module accordion */}
            {data.modules.map((mod) => {
              const isOpen = openModuleId === mod.id;
              return (
                <div key={mod.id} className={styles.childModuleGroup}>
                  <div className={styles.childModuleHeader}>
                    {/* Chevron toggles lesson list */}
                    <button
                      type="button"
                      className={`${styles.collapseButton} ${isOpen ? styles.collapseButtonOpen : ""}`}
                      aria-label={
                        isOpen
                          ? t("admin.contents.listing.collapseLessons", "Collapse lessons")
                          : t("admin.contents.listing.expandLessons", "Expand lessons")
                      }
                      aria-expanded={isOpen}
                      onClick={() => setOpenModuleId((prev) => (prev === mod.id ? null : mod.id))}
                    >
                      <ChevronRight size={16} />
                    </button>
                    {/* Module title / Edit button — does NOT change accordion state */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={styles.childModuleTitle}
                      onClick={() => setSelectedChildId(mod.id)}
                    >
                      {mod.title}
                    </Button>
                  </div>
                  {/* Nested lessons (shown only when module is expanded) */}
                  {isOpen && (
                    <div className={styles.childModuleLessons}>
                      {mod.lessons.map((lesson) => (
                        <Button
                          key={lesson.id}
                          type="button"
                          variant="outline"
                          fullWidth
                          className={`${styles.childItem} ${styles.childItemIndent}`}
                          onClick={() => setSelectedChildId(lesson.id)}
                        >
                          {lesson.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
