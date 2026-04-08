"use client";

import type { ScholarContentDto } from "@sd/core-contracts";

export type ScholarContentListWebProps = {
  content: ScholarContentDto;
};

export function ScholarContentListWeb({ content }: ScholarContentListWebProps) {
  return (
    <div>
      {content.collections.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Collections</h2>
          {content.collections.map((c) => (
            <div key={c.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {c.lectureCount} series
              </div>
            </div>
          ))}
        </section>
      )}

      {content.standaloneSeries.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Series</h2>
          {content.standaloneSeries.map((s) => (
            <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {s.lectureCount} lectures
              </div>
            </div>
          ))}
        </section>
      )}

      {content.standaloneLectures.length > 0 && (
        <section>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Lectures</h2>
          {content.standaloneLectures.map((l) => (
            <div key={l.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} min` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {content.collections.length === 0 &&
        content.standaloneSeries.length === 0 &&
        content.standaloneLectures.length === 0 && (
          <p style={{ color: "#888", fontSize: 14 }}>No published content yet.</p>
        )}
    </div>
  );
}
