"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { createScholar, updateScholar, type AdminScholarInput } from "../../api/admin.api";

type ScholarsListDto = { scholars: ScholarListItemDto[] };

export function AdminScholarsMobileWebScreen() {
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
    return <div style={{ padding: 16 }}>Loading scholars...</div>;
  }

  const scholars = data?.scholars ?? [];

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
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Scholars</h1>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setFormData({ name: "", slug: "" });
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
          <h3 style={{ marginBottom: 8, fontSize: 16 }}>{editing ? "Edit" : "New Scholar"}</h3>
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
          <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13 }}>
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

      {scholars.map((s) => (
        <div
          key={s.id}
          style={{
            padding: 12,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {s.slug} · {s.lectureCount} lectures
            </div>
          </div>
          <button
            onClick={() => {
              setEditing(s);
              setCreating(false);
              setFormData({ name: s.name, slug: s.slug, isKibar: s.isKibar });
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
        </div>
      ))}
    </div>
  );
}
