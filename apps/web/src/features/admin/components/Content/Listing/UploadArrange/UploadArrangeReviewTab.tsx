/** Documents this module's responsibility and public boundary. */
"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import React from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  ROOT_MODULE_KEY,
  itemTargetSlug,
  type UploadArrangeAction,
  type UploadArrangeState,
  type UploadItem,
} from "@/features/admin/hooks/Content/useUploadArrangeState";

import styles from "./upload-arrange.module.css";

interface UploadArrangeReviewTabProps {
  /** Documents the intent and contract of this field. */ state: UploadArrangeState;
  dispatch: React.Dispatch<UploadArrangeAction>;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderStatusIcon(status: UploadItem["upload"]["status"]) {
  if (status === "done") return <CheckCircle size={14} className={styles.statusIconSuccess} />;
  if (status === "error") return <AlertCircle size={14} className={styles.statusIconError} />;
  return null;
}

function renderProgress(item: UploadItem, isBusy: boolean) {
  if (!isBusy && item.upload.status !== "error") return null;
  return (
    <div className={styles.progressTrack}>
      <div
        className={`${styles.progressFill} ${
          item.upload.status === "error" ? styles.progressFillError : ""
        }`}
        style={{ width: `${item.upload.percent}%` }}
      />
    </div>
  );
}

function renderUploadDetails(item: UploadItem, isBusy: boolean, statusLabel: string | null) {
  const { loadedBytes, totalBytes } = item.upload;
  if (!isBusy || !statusLabel || loadedBytes === undefined || totalBytes === undefined) return null;
  return (
    <span className={styles.fileMeta}>
      {`${statusLabel} ${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)}`}
    </span>
  );
}

function ItemRow({
  item,
  state,
}: {
  item: UploadItem;
  /** Documents the intent and contract of this field. */ state: UploadArrangeState;
}) {
  const { t } = useTranslation();
  const isBusy = state.phase === "presigning" || state.phase === "uploading";
  const action =
    item.assignment.kind === "new-lesson"
      ? t("admin.contents.listing.reviewNewLesson", "New lesson")
      : t("admin.contents.listing.reviewReplaceAudio", "Replace audio");

  const { status } = item.upload;
  const statusLabel =
    status === "downloading"
      ? t("admin.contents.listing.statusDownloading", "Downloading…")
      : status === "uploading"
        ? t("admin.contents.listing.statusUploading", "Uploading…")
        : null;

  return (
    <div className={styles.reviewRow}>
      <div className={styles.reviewRowHeader}>
        <span className={styles.reviewValue}>
          {item.title} <span className={styles.fileMeta}>({itemTargetSlug(state, item)})</span>
        </span>
        <span className={styles.reviewLabel}>
          {action}
          {renderStatusIcon(item.upload.status)}
        </span>
      </div>
      {renderProgress(item, isBusy)}
      {renderUploadDetails(item, isBusy, statusLabel)}
      {item.upload.error && <span className={styles.conflictText}>{item.upload.error}</span>}
    </div>
  );
}

type ReviewGroup = { title: string; isNewModule: boolean; items: UploadItem[] };

function buildReviewGroups(
  state: UploadArrangeState,
  t: ReturnType<typeof useTranslation>["t"],
): ReviewGroup[] {
  const { existing } = state;
  if (!existing) return [];
  if (existing.format !== "collection") {
    return [{ title: existing.title, isNewModule: false, items: state.items }];
  }

  const groups: ReviewGroup[] = [];
  for (const mod of state.newModules) {
    groups.push({
      title: mod.title,
      isNewModule: true,
      items: state.items.filter(
        (item) =>
          item.assignment.kind === "new-lesson" &&
          item.assignment.moduleKey === `new:${mod.tempId}`,
      ),
    });
  }
  for (const mod of existing.modules) {
    const items = state.items.filter((item) => {
      const assignment = item.assignment;
      if (assignment.kind === "new-lesson") return assignment.moduleKey === mod.id;
      if (assignment.kind === "replace-audio") {
        return mod.lessons.some((l) => l.id === assignment.lessonId);
      }
      return false;
    });
    if (items.length > 0) groups.push({ title: mod.title, isNewModule: false, items });
  }
  const unassigned = state.items.filter(
    (item) =>
      item.assignment.kind === "new-lesson" && item.assignment.moduleKey === ROOT_MODULE_KEY,
  );
  if (unassigned.length > 0) {
    groups.push({
      title: t("admin.contents.listing.unassigned", "Unassigned"),
      isNewModule: false,
      items: unassigned,
    });
  }
  return groups;
}

/** Documents the intent and contract of this declaration. */
export function UploadArrangeReviewTab({ state }: UploadArrangeReviewTabProps) {
  const { t } = useTranslation();
  const { existing } = state;

  if (!existing || state.items.length === 0) {
    return (
      <div className={styles.emptyHint}>
        {t("admin.contents.listing.reviewEmpty", "Nothing staged for upload yet.")}
      </div>
    );
  }

  const groups = buildReviewGroups(state, t);

  return (
    <div className={styles.arrangeStack}>
      {groups.map((group) => (
        <div key={group.title} className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {group.isNewModule
              ? `${t("admin.contents.listing.reviewCreateModule", "Create module")}: ${group.title}`
              : group.title}
          </h3>
          {group.items.map((item) => (
            <ItemRow key={item.id} item={item} state={state} />
          ))}
        </div>
      ))}
    </div>
  );
}
