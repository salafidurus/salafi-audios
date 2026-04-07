"use client";

import type { ScholarDetailDto } from "@sd/core-contracts";

export type ScholarHeaderWebProps = {
  scholar: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  };
};

export function ScholarHeaderWeb({ scholar }: ScholarHeaderWebProps) {
  const totalHours = Math.round(scholar.totalDurationSeconds / 3600);

  return (
    <div>
      {scholar.imageUrl && (
        <img
          src={scholar.imageUrl}
          alt={scholar.name}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            objectFit: "cover",
            marginBottom: 16,
          }}
        />
      )}
      <h1 style={{ margin: 0, fontSize: 28 }}>{scholar.name}</h1>
      {(scholar.country || scholar.mainLanguage) && (
        <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
          {[scholar.country, scholar.mainLanguage].filter(Boolean).join(" · ")}
        </p>
      )}
      {scholar.bio && <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>{scholar.bio}</p>}

      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{scholar.lectureCount}</div>
          <div style={{ fontSize: 12, color: "#888" }}>Lectures</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: "bold" }}>{scholar.seriesCount}</div>
          <div style={{ fontSize: 12, color: "#888" }}>Series</div>
        </div>
        {totalHours > 0 && (
          <div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>{totalHours}h</div>
            <div style={{ fontSize: 12, color: "#888" }}>Total</div>
          </div>
        )}
      </div>

      {(scholar.socialTwitter ||
        scholar.socialTelegram ||
        scholar.socialYoutube ||
        scholar.socialWebsite) && (
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {scholar.socialWebsite && (
            <a
              href={scholar.socialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontSize: 14 }}
            >
              Website
            </a>
          )}
          {scholar.socialYoutube && (
            <a
              href={scholar.socialYoutube}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontSize: 14 }}
            >
              YouTube
            </a>
          )}
          {scholar.socialTwitter && (
            <a
              href={scholar.socialTwitter}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontSize: 14 }}
            >
              Twitter
            </a>
          )}
          {scholar.socialTelegram && (
            <a
              href={scholar.socialTelegram}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", fontSize: 14 }}
            >
              Telegram
            </a>
          )}
        </div>
      )}
    </div>
  );
}
