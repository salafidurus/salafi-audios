"use client";

import React, { useReducer } from "react";
import { useApiQuery } from "@sd/core-contracts";
import type { AdminListingDetailDto, AdminListingListDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/Button";
import { fetchAdminLectures, fetchAdminLectureDetail } from "../../api/admin-lectures.api";
import { AudioUploader } from "../../components/AudioUploader/AudioUploader";
import { LectureEditModal } from "../../components/LectureEditModal/LectureEditModal";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import styles from "./admin-lectures.screen.module.css";
import { Search, Plus, X, Edit } from "lucide-react";

type AudioData = {
  audioKey: string;
  durationSeconds: number;
  sizeBytes: number;
  format: string;
  filename: string;
};

type ScreenState = {
  search: string;
  status: string;
  page: number;
  isUploaderOpen: boolean;
  isModalOpen: boolean;
  selectedLecture: AdminListingDetailDto | null;
  initialAudioData: AudioData | null;
};

function screenReducer(state: ScreenState, patch: Partial<ScreenState>): ScreenState {
  return { ...state, ...patch };
}

function formatDuration(secs?: number): string {
  if (!secs) return "--:--";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const parts = [
    h > 0 ? String(h) : null,
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].filter(Boolean);
  return parts.join(":");
}

export function AdminLecturesScreen() {
  const isDesktop = useIsDesktop();
  const [state, dispatch] = useReducer(screenReducer, {
    search: "",
    status: "",
    page: 1,
    isUploaderOpen: false,
    isModalOpen: false,
    selectedLecture: null,
    initialAudioData: null,
  });

  const { search, status, page, isUploaderOpen, isModalOpen, selectedLecture, initialAudioData } =
    state;
  const limit = isDesktop ? 20 : 15;

  const { data, isFetching, refetch } = useApiQuery<AdminListingListDto>(
    ["admin", "lectures", "list", { search, status, page }],
    () => fetchAdminLectures({ search, status, page, limit }),
  );

  const handleEditClick = async (lectureId: string) => {
    try {
      const details = await fetchAdminLectureDetail(lectureId);
      dispatch({ selectedLecture: details, initialAudioData: null, isModalOpen: true });
    } catch {
      // ignore: user stays on current view
    }
  };

  const handleUploadComplete = (audioInfo: AudioData | null) => {
    dispatch({
      initialAudioData: audioInfo,
      selectedLecture: null,
      isUploaderOpen: false,
      isModalOpen: true,
    });
  };

  const lectures = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <ScreenView>
      <PageHeader
        title="Manage Lectures"
        actions={
          <Button
            variant="primary"
            icon={
              isUploaderOpen ? (
                <X size={isDesktop ? 16 : 20} />
              ) : (
                <Plus size={isDesktop ? 16 : 20} />
              )
            }
            onClick={() => dispatch({ isUploaderOpen: !isUploaderOpen })}
            aria-label="Upload Audio Toggle"
          >
            {isDesktop ? (isUploaderOpen ? "Close Uploader" : "Upload Audio") : undefined}
          </Button>
        }
      />

      {isUploaderOpen && (
        <div className={styles.uploaderWrapper}>
          <AudioUploader onUploadComplete={handleUploadComplete} />
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={isDesktop ? 18 : 16} />
          <input
            type="text"
            placeholder="Search lectures..."
            aria-label="Search lectures"
            className={styles.searchInput}
            value={search}
            onChange={(e) => {
              dispatch({ search: e.target.value, page: 1 });
            }}
          />
        </div>

        <div className={styles.statusTabs}>
          <button
            type="button"
            className={`${styles.tab} ${status === "" ? styles.tabActive : ""}`}
            onClick={() => dispatch({ status: "", page: 1 })}
          >
            {isDesktop ? "All" : "All"}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${status === "published" ? styles.tabActive : ""}`}
            onClick={() => dispatch({ status: "published", page: 1 })}
          >
            {isDesktop ? "Published" : "Pub"}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${status === "draft" ? styles.tabActive : ""}`}
            onClick={() => dispatch({ status: "draft", page: 1 })}
          >
            {isDesktop ? "Draft" : "Draft"}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${status === "archived" ? styles.tabActive : ""}`}
            onClick={() => dispatch({ status: "archived", page: 1 })}
          >
            {isDesktop ? "Archived" : "Arch"}
          </button>
        </div>
      </div>

      {isFetching ? (
        <EmptyState variant="loading" message="Loading lectures..." />
      ) : (
        <>
          {lectures.length === 0 ? (
            <EmptyState message="No lectures found matching the filters." />
          ) : isDesktop ? (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Scholar</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map((lecture) => (
                    <tr key={lecture.id}>
                      <td className={styles.lectureTitle}>{lecture.title}</td>
                      <td>{lecture.scholarName}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[`badge-${lecture.status}`]}`}>
                          {lecture.status}
                        </span>
                      </td>
                      <td>{formatDuration(lecture.durationSeconds)}</td>
                      <td>{new Date(lecture.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => handleEditClick(lecture.id)}
                            aria-label="Edit"
                          >
                            <Edit size={16} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.cardsList}>
              {lectures.map((lecture) => (
                <div key={lecture.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{lecture.title}</h3>
                    <span className={`${styles.badge} ${styles[`badge-${lecture.status}`]}`}>
                      {lecture.status}
                    </span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaLabel}>Scholar:</span>
                    <span className={styles.metaValue}>{lecture.scholarName}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaLabel}>Duration:</span>
                    <span className={styles.metaValue}>
                      {formatDuration(lecture.durationSeconds)}
                    </span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaLabel}>Uploaded:</span>
                    <span className={styles.metaValue}>
                      {new Date(lecture.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.cardEditBtn}
                      onClick={() => handleEditClick(lecture.id)}
                      aria-label="Edit lecture"
                    >
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => dispatch({ page: page - 1 })}
              >
                {isDesktop ? "Previous" : "Prev"}
              </button>
              <span className={styles.pageInfo}>
                {isDesktop ? `Page ${page} of ${totalPages}` : `${page} / ${totalPages}`}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => dispatch({ page: page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <LectureEditModal
        isOpen={isModalOpen}
        onClose={() => dispatch({ isModalOpen: false })}
        onSuccess={refetch}
        lecture={selectedLecture}
        initialAudioData={initialAudioData}
      />
    </ScreenView>
  );
}
