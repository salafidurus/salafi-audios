"use client";

import React, { useReducer } from "react";
import { useApiQuery } from "@sd/core-contracts";
import type { AdminLectureDetailDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { fetchAdminLectures, fetchAdminLectureDetail } from "../../api/admin-lectures.api";
import { AudioUploader } from "../../components/AudioUploader/AudioUploader";
import { LectureEditModal } from "../../components/LectureEditModal/LectureEditModal";
import styles from "./admin-lectures.screen.desktop.module.css";
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
  selectedLecture: AdminLectureDetailDto | null;
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

export function AdminLecturesDesktopScreen() {
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
  const limit = 20;

  const { data, isFetching, refetch } = useApiQuery(
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
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Manage Lectures</h1>
          <button
            type="button"
            className={styles.uploadTriggerBtn}
            onClick={() => dispatch({ isUploaderOpen: !isUploaderOpen })}
          >
            {isUploaderOpen ? (
              <>
                <X size={16} /> Close Uploader
              </>
            ) : (
              <>
                <Plus size={16} /> Upload Audio
              </>
            )}
          </button>
        </div>

        {isUploaderOpen && (
          <div className={styles.uploaderWrapper}>
            <AudioUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}

        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
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
              All
            </button>
            <button
              type="button"
              className={`${styles.tab} ${status === "published" ? styles.tabActive : ""}`}
              onClick={() => dispatch({ status: "published", page: 1 })}
            >
              Published
            </button>
            <button
              type="button"
              className={`${styles.tab} ${status === "draft" ? styles.tabActive : ""}`}
              onClick={() => dispatch({ status: "draft", page: 1 })}
            >
              Draft
            </button>
            <button
              type="button"
              className={`${styles.tab} ${status === "archived" ? styles.tabActive : ""}`}
              onClick={() => dispatch({ status: "archived", page: 1 })}
            >
              Archived
            </button>
          </div>
        </div>

        {isFetching ? (
          <div className={styles.loading}>Loading lectures...</div>
        ) : (
          <>
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
                  {lectures.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.noData}>
                        No lectures found matching the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page <= 1}
                  onClick={() => dispatch({ page: page - 1 })}
                >
                  Previous
                </button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
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
      </div>
    </ScreenView>
  );
}
