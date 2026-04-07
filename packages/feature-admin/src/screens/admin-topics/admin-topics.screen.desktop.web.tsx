"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto } from "@sd/core-contracts";
import { createTopic, updateTopic, deleteTopic, type AdminTopicInput } from "../../api/admin.api";

export function AdminTopicsDesktopWebScreen() {
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
    return <div style={{ padding: 32 }}>Loading topics...</div>;
  }

  const topics = data ?? [];

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
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Manage Topics</h1>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setFormData({ slug: "", name: "" });
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
          + Add Topic
        </button>
      </div>

      {(creating || editing) && (
        <div
          style={{ padding: 16, border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 24 }}
        >
          <h3 style={{ marginBottom: 12 }}>{editing ? "Edit Topic" : "New Topic"}</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <input
              placeholder="Slug"
              value={formData.slug}
              onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
            <input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
            <input
              placeholder="Parent slug (optional)"
              value={formData.parentSlug ?? ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, parentSlug: e.target.value || undefined }))
              }
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            />
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
            <th style={{ padding: 8 }}>Parent</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => (
            <tr key={t.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: 8 }}>{t.name}</td>
              <td style={{ padding: 8, color: "#666" }}>{t.slug}</td>
              <td style={{ padding: 8, color: "#999" }}>{t.parentId ?? "—"}</td>
              <td style={{ padding: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditing(t);
                      setCreating(false);
                      setFormData({ slug: t.slug, name: t.name });
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
                  <button
                    onClick={() => handleDelete(t.slug)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 4,
                      border: "1px solid #fca5a5",
                      background: "#fef2f2",
                      color: "#dc2626",
                      cursor: "pointer",
                    }}
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
  );
}
