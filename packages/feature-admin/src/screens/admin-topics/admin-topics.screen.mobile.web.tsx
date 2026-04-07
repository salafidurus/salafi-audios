"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { TopicDetailDto } from "@sd/core-contracts";
import { createTopic, updateTopic, deleteTopic, type AdminTopicInput } from "../../api/admin.api";

export function AdminTopicsMobileWebScreen() {
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
    return <div style={{ padding: 16 }}>Loading topics...</div>;
  }

  const topics = data ?? [];

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Topics</h1>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setFormData({ slug: "", name: "" });
          }}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: 13,
          }}
        >
          + Add
        </button>
      </div>

      {(creating || editing) && (
        <div
          style={{ padding: 12, border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 16 }}
        >
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>{editing ? "Edit" : "New Topic"}</h3>
          <input
            placeholder="Slug"
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            style={{
              width: "100%",
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            style={{
              width: "100%",
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <input
            placeholder="Parent slug (optional)"
            value={formData.parentSlug ?? ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, parentSlug: e.target.value || undefined }))
            }
            style={{
              width: "100%",
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "none",
                background: "#16a34a",
                color: "#fff",
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
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {topics.map((t) => (
        <div
          key={t.id}
          style={{
            padding: 12,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{t.slug}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setEditing(t);
                setCreating(false);
                setFormData({ slug: t.slug, name: t.name });
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid #ccc",
                background: "#fff",
                fontSize: 12,
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(t.slug)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#dc2626",
                fontSize: 12,
              }}
            >
              Del
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
