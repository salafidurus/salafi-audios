"use client";

import type { ScholarContentDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type ScholarContentListProps = {
  content: ScholarContentDto;
};

export function ScholarContentList({ content }: ScholarContentListProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();

  return (
    <div>
      {content.collections.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>
            {t("scholarContent.collections", "Collections")}
          </h2>
          {content.collections.map((c) => {
            const title = pickContentField(c.title, c.original?.title, showOriginal);
            return (
              <div key={c.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {t("scholarContent.seriesCount", "{{count}} series", {
                    count: c.lectureCount,
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {content.series.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>{t("scholarContent.series", "Series")}</h2>
          {content.series.map((s) => {
            const title = pickContentField(s.title, s.original?.title, showOriginal);
            return (
              <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {t("scholarContent.lectureCount", "{{count}} lectures", {
                    count: s.lectureCount,
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {content.singles.length > 0 && (
        <section>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>
            {t("scholarContent.singles", "Singles")}
          </h2>
          {content.singles.map((l) => {
            const title = pickContentField(l.title, l.original?.title, showOriginal);
            return (
              <div key={l.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} min` : ""}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {content.collections.length === 0 &&
        content.series.length === 0 &&
        content.singles.length === 0 && (
          <p style={{ color: "#888", fontSize: 14 }}>
            {t("scholarContent.empty", "No published content yet.")}
          </p>
        )}
    </div>
  );
}
