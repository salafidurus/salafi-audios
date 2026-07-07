"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import {
  createTopic,
  updateTopic,
  deleteTopic,
  type AdminTopicInput,
} from "@/features/admin/api/admin.api";
import styles from "./admin-topics.screen.desktop.module.css";

export function AdminTopicsDesktopScreen() {
  const { data, isFetching, refetch } = useApiQuery<TopicDetailDto[]>(queryKeys.topics.list(), () =>
    httpClient<TopicDetailDto[]>({ url: endpoints.topics.list, method: "GET" }),
  );
  const [editing, setEditing] = useState<TopicDetailDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<AdminTopicInput>({ slug: "", name: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateTopic(editing.slug, formData);
      } else {
        await createTopic(formData);
      }
      setEditing(null);
      setCreating(false);
      setFormData({ slug: "", name: "" });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete topic "${slug}"?`)) return;
    await deleteTopic(slug);
    refetch();
  };

  if (isFetching) {
    return (
      <ScreenView>
        <div className={styles.loading}>Loading topics…</div>
      </ScreenView>
    );
  }

  const topics = data ?? [];

  return (
    <ScreenView>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Manage Topics</h1>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
              setFormData({ slug: "", name: "" });
            }}
            className={styles.addButton}
          >
            + Add Topic
          </button>
        </div>

        {(creating || editing) && (
          <div className={styles.form}>
            <h3 className={styles.formTitle}>{editing ? "Edit Topic" : "New Topic"}</h3>
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
            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setEditing(null);
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                <td className={styles.tableCell}>{t.name}</td>
                <td className={`${styles.tableCell} ${styles.tableCellMuted}`}>{t.slug}</td>
                <td className={`${styles.tableCell} ${styles.tableCellFaint}`}>
                  {t.parentId ?? "—"}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(t);
                        setCreating(false);
                        setFormData({ slug: t.slug, name: t.name });
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.slug)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScreenView>
  );
}
