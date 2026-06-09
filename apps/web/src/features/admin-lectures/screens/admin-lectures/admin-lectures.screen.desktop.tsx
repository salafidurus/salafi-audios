"use client";

import React, { useState } from "react";
import { useApiQuery } from "@sd/core-contracts";
import type { AdminLectureDetailDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { fetchAdminLectures, fetchAdminLectureDetail } from "../../api/admin-lectures.api";
import { AudioUploader } from "../../components/AudioUploader/AudioUploader";
import { LectureEditModal } from "../../components/LectureEditModal/LectureEditModal";
import styles from "./admin-lectures.screen.desktop.module.css";
import { Search, Plus, X, Edit } from "lucide-react";

export function AdminLecturesDesktopScreen() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(""); // Empty means all
  const [page, setPage] = useState(1);
  const limit = 20;

  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<AdminLectureDetailDto | null>(null);
  const [initialAudioData, setInitialAudioData] = useState<{
    audioKey: string;
    durationSeconds: number;
    sizeBytes: number;
    format: string;
    filename: string;
  } | null>(null);

  const { data, isFetching, refetch } = useApiQuery(
    ["admin", "lectures", "list", { search, status, page }],
    () => fetchAdminLectures({ search, status, page, limit }),
  );

  const handleEditClick = async (lectureId: string) => {
    try {
      const details = await fetchAdminLectureDetail(lectureId);
      setSelectedLecture(details);
      setInitialAudioData(null);
      setIsModalOpen(true);
    } catch {
      // ignore: user stays on current view
    }
  };

  const handleUploadComplete = (audioInfo: typeof initialAudioData) => {
    setInitialAudioData(audioInfo);
    setSelectedLecture(null);
    setIsUploaderOpen(false);
    setIsModalOpen(true);
  };

  const formatDuration = (secs?: number) => {
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
            onClick={() => setIsUploaderOpen(!isUploaderOpen)}
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
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className={styles.statusTabs}>
            <button
              type="button"
              className={`${styles.tab} ${status === "" ? styles.tabActive : ""}`}
              onClick={() => {
                setStatus("");
                setPage(1);
              }}
            >
              All
            </button>
            <button
              type="button"
              className={`${styles.tab} ${status === "published" ? styles.tabActive : ""}`}
              onClick={() => {
                setStatus("published");
                setPage(1);
              }}
            >
              Published
            </button>
            <button
              type="button"
              className={`${styles.tab} ${status === "draft" ? styles.tabActive : ""}`}
              onClick={() => {
                setStatus("draft");
                setPage(1);
              }}
            >
              Draft
            </button>
            <button
              type="button"
              className={`${styles.tab} ${status === "archived" ? styles.tabActive : ""}`}
              onClick={() => {
                setStatus("archived");
                setPage(1);
              }}
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
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <LectureEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refetch}
          lecture={selectedLecture}
          initialAudioData={initialAudioData}
        />
      </div>
    </ScreenView>
  );
}
