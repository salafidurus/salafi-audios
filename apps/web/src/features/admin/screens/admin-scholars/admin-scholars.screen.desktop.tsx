"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import {
  createScholar,
  updateScholar,
  type AdminScholarInput,
} from "@/features/admin/api/admin.api";
import styles from "./admin-scholars.screen.desktop.module.css";

type ScholarsListDto = { scholars: ScholarListItemDto[] };

export function AdminScholarsDesktopScreen() {
  const { data, isFetching, refetch } = useApiQuery<ScholarsListDto>(
    queryKeys.scholars.list(),
    () => httpClient<ScholarsListDto>({ url: endpoints.scholars.list, method: "GET" }),
  );
  const [editing, setEditing] = useState<ScholarListItemDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<AdminScholarInput>({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateScholar(editing.id, formData);
      } else {
        await createScholar(formData);
      }
      setEditing(null);
      setCreating(false);
      setFormData({ name: "", slug: "" });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  if (isFetching) {
    return (
      <ScreenView>
        <div className={styles.loading}>Loading scholars…</div>
      </ScreenView>
    );
  }

  const scholars = data?.scholars ?? [];

  return (
    <ScreenView>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Manage Scholars</h1>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setEditing(null);
              setFormData({ name: "", slug: "" });
            }}
            className={styles.addButton}
          >
            + Add Scholar
          </button>
        </div>

        {(creating || editing) && (
          <div className={styles.form}>
            <h3 className={styles.formTitle}>{editing ? "Edit Scholar" : "New Scholar"}</h3>
            <div className={styles.formGrid}>
              <input
                aria-label="Scholar name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Scholar slug"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Scholar bio"
                placeholder="Bio"
                value={formData.bio ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                className={styles.input}
              />
              <input
                aria-label="Scholar image URL"
                placeholder="Image URL"
                value={formData.imageUrl ?? ""}
                onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
                className={styles.input}
              />
            </div>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isKibar ?? false}
                  onChange={(e) => setFormData((p) => ({ ...p, isKibar: e.target.checked }))}
                />{" "}
                Kibar
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isFeatured ?? false}
                  onChange={(e) => setFormData((p) => ({ ...p, isFeatured: e.target.checked }))}
                />{" "}
                Featured
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                />{" "}
                Active
              </label>
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
              <th className={styles.tableHead}>Kibar</th>
              <th className={styles.tableHead}>Lectures</th>
              <th className={styles.tableHead}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scholars.map((s) => (
              <tr key={s.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{s.name}</td>
                <td className={`${styles.tableCell} ${styles.tableCellMuted}`}>{s.slug}</td>
                <td className={styles.tableCell}>{s.isKibar ? "Yes" : "No"}</td>
                <td className={styles.tableCell}>{s.lectureCount}</td>
                <td className={styles.tableCell}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(s);
                      setCreating(false);
                      setFormData({ name: s.name, slug: s.slug, isKibar: s.isKibar });
                    }}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScreenView>
  );
}
