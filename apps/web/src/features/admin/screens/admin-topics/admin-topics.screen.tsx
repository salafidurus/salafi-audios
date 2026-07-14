"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto } from "@sd/core-contracts";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/Button";
import { Plus } from "lucide-react";
import { createTopic, updateTopic, deleteTopic } from "@/features/admin/api/admin.api";
import { Modal } from "@/shared/components/Modal";
import styles from "./admin-topics.screen.module.css";

export function AdminTopicsScreen() {
  const { isMobile } = useResponsive();
  const { data, isFetching, refetch } = useApiQuery<TopicDetailDto[]>(queryKeys.topics.list(), () =>
    httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );
  const [editing, setEditing] = useState<TopicDetailDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<{ slug: string; name: string; parentSlug?: string }>({
    slug: "",
    name: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  // react-doctor-disable-next-line react-doctor/rerender-state-only-in-handlers
  const [deletingTopicSlug, setDeletingTopicSlug] = useState<string | null>(null);
  const [deletingTopicName, setDeletingTopicName] = useState<string>("");

  const handleSave = async () => {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setSaving(true);
    try {
      const payload = {
        slug: formData.slug,
        name: { en: formData.name },
        parentSlug: formData.parentSlug,
      };
      if (editing) {
        await updateTopic(editing.slug, payload);
      } else {
        await createTopic(payload);
      }
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setEditing(null);
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setCreating(false);
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setFormData({ slug: "", name: "" });
      refetch();
    } finally {
      // react-doctor-disable-next-line react-doctor/no-impure-state-updater
      setSaving(false);
    }
  };

  const handleDeleteClick = (slug: string, name: string) => {
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeletingTopicSlug(slug);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeletingTopicName(name);
    // react-doctor-disable-next-line react-doctor/no-impure-state-updater
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTopicSlug) return;
    await deleteTopic(deletingTopicSlug);
    setDeleteModalOpen(false);
    setDeletingTopicSlug(null);
    setDeletingTopicName("");
    refetch();
  };

  if (isFetching) {
    return (
      <ScreenView>
        <PageHeader title={!isMobile ? "Manage Topics" : "Topics"} />
        <EmptyState variant="loading" message="Loading topics…" />
      </ScreenView>
    );
  }

  const topics = data ?? [];

  return (
    <ScreenView>
      <Modal.ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingTopicSlug(null);
          setDeletingTopicName("");
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Topic?"
        confirmLabel="Delete Topic"
        confirmVariant="danger"
      >
        <p>
          Are you sure you want to delete the topic <strong>{deletingTopicName}</strong>?
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--content-muted)", marginTop: "0.5rem" }}>
          This action cannot be undone.
        </p>
      </Modal.ConfirmDialog>

      <PageHeader
        title={!isMobile ? "Manage Topics" : "Topics"}
        actions={
          <Button
            variant="primary"
            size={!isMobile ? "md" : "sm"}
            icon={<Plus size={!isMobile ? 18 : 16} />}
            onClick={() => {
              setCreating(true);
              setEditing(null);
              setFormData({ slug: "", name: "" });
            }}
          >
            {!isMobile ? "Add Topic" : "Add"}
          </Button>
        }
      />

      {(creating || editing) && (
        <div className={styles.form}>
          <h3 className={styles.formTitle}>
            {editing ? (!isMobile ? "Edit Topic" : "Edit") : "New Topic"}
          </h3>
          {!isMobile ? (
            <div className={styles.formGrid}>
              <input
                aria-label="Topic slug"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Topic name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Parent topic slug"
                placeholder="Parent slug (optional)"
                value={formData.parentSlug ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, parentSlug: e.target.value || undefined }))
                }
                className={styles.input}
              />
            </div>
          ) : (
            <>
              <input
                aria-label="Topic slug"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Topic name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Parent topic slug"
                placeholder="Parent slug (optional)"
                value={formData.parentSlug ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, parentSlug: e.target.value || undefined }))
                }
                className={styles.input}
              />
            </>
          )}
          <div className={styles.buttonGroup}>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!isMobile ? (
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.tableHead}>Name</th>
              <th className={styles.tableHead}>Slug</th>
              <th className={styles.tableHead}>Parent</th>
              <th className={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{t.name.en}</td>
                <td className={`${styles.tableCell} ${styles.tableCellMuted}`}>{t.slug}</td>
                <td className={`${styles.tableCell} ${styles.tableCellFaint}`}>
                  {t.parentId ?? "—"}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(t);
                        setCreating(false);
                        setFormData({ slug: t.slug, name: t.name.en });
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteClick(t.slug, t.name.en)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          {topics.map((t) => (
            <div key={t.id} className={styles.topicCard}>
              <div className={styles.topicInfo}>
                <div className={styles.topicName}>{t.name.en}</div>
                <div className={styles.topicSlug}>{t.slug}</div>
              </div>
              <div className={styles.actionButtons}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(t);
                    setCreating(false);
                    setFormData({ slug: t.slug, name: t.name.en });
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteClick(t.slug, t.name.en)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </ScreenView>
  );
}
