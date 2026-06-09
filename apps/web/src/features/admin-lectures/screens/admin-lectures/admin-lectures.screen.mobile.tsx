"use client";

import React, { useState } from "react";
import { useApiQuery } from "@sd/core-contracts";
import type { AdminLectureListItemDto, AdminLectureDetailDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { fetchAdminLectures, fetchAdminLectureDetail } from "../../api/admin-lectures.api";
import { AudioUploader } from "../../components/AudioUploader/AudioUploader";
import { LectureEditModal } from "../../components/LectureEditModal/LectureEditModal";
import styles from "./admin-lectures.screen.mobile.module.css";
import { Search, Plus, X, Edit } from "lucide-react";

export function AdminLecturesMobileScreen() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(""); // Empty means all
  const [page, setPage] = useState(1);
  const limit = 15;

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
    } catch (err) {
      console.error("Failed to fetch lecture details", err);
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
            aria-label="Upload Audio Toggle"
          >
            {isUploaderOpen ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>

        {isUploaderOpen && (
          <div className={styles.uploaderWrapper}>
            <AudioUploader onUploadComplete={handleUploadComplete} />
          </div>
        )}

        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
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
        </div>

        <div className={styles.tabsSection}>
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
              Pub
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
              Arch
            </button>
          </div>
        </div>

        {isFetching ? (
          <div className={styles.loading}>Loading lectures...</div>
        ) : (
          <>
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
                    >
                      <Edit size={14} /> Edit
                    </button>
                  </div>
                </div>
              ))}
              {lectures.length === 0 && (
                <div className={styles.noData}>No lectures found matching the filters.</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.pageBtn}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span className={styles.pageInfo}>
                  {page} / {totalPages}
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
