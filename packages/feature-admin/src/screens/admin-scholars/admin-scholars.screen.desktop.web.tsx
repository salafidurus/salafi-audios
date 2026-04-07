"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { createScholar, updateScholar, type AdminScholarInput } from "../../api/admin.api";

type ScholarsListDto = { scholars: ScholarListItemDto[] };

export function AdminScholarsDesktopWebScreen() {
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
    return <div style={{ padding: 32 }}>Loading scholars...</div>;
  }

  const scholars = data?.scholars ?? [];

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Manage Scholars</h1>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setFormData({ name: "", slug: "" });
          }}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          + Add Scholar
        </button>
      </div>

      {(creating || editing) && (
        <div
          style={{ padding: 16, border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 24 }}
        >
          <h3 style={{ marginBottom: 12 }}>{editing ? "Edit Scholar" : "New Scholar"}</h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}
          >
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
            <input
              placeholder="Slug"
              value={formData.slug}
              onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
            <input
              placeholder="Bio"
              value={formData.bio ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
            <input
              placeholder="Image URL"
              value={formData.imageUrl ?? ""}
              onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
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
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#16a34a",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Slug</th>
            <th style={{ padding: 8 }}>Kibar</th>
            <th style={{ padding: 8 }}>Lectures</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {scholars.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: 8 }}>{s.name}</td>
              <td style={{ padding: 8, color: "#666" }}>{s.slug}</td>
              <td style={{ padding: 8 }}>{s.isKibar ? "Yes" : "No"}</td>
              <td style={{ padding: 8 }}>{s.lectureCount}</td>
              <td style={{ padding: 8 }}>
                <button
                  onClick={() => {
                    setEditing(s);
                    setCreating(false);
                    setFormData({ name: s.name, slug: s.slug, isKibar: s.isKibar });
                  }}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
