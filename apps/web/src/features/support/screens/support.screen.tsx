"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";

export function SupportScreen() {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();

  const sections = [
    {
      title: t("support.faqSection"),
      items: [
        { q: t("support.faq.whatIs.q"), a: t("support.faq.whatIs.a") },
        { q: t("support.faq.saveLectures.q"), a: t("support.faq.saveLectures.a") },
        { q: t("support.faq.offline.q"), a: t("support.faq.offline.a") },
        { q: t("support.faq.followScholar.q"), a: t("support.faq.followScholar.a") },
      ],
    },
    {
      title: t("support.contactSection"),
      items: [
        { q: t("support.contact.email.q"), a: t("support.contact.email.a") },
        { q: t("support.contact.responseTime.q"), a: t("support.contact.responseTime.a") },
      ],
    },
  ];

  const containerStyle: React.CSSProperties = isDesktop
    ? { maxWidth: 720, margin: "0 auto", padding: "32px 16px" }
    : { padding: "16px 12px" };

  const titleStyle: React.CSSProperties = isDesktop
    ? { fontSize: 28, fontWeight: 700, marginBottom: 24 }
    : { fontSize: 22, fontWeight: 700, marginBottom: 16 };

  const sectionStyle: React.CSSProperties = isDesktop ? { marginBottom: 32 } : { marginBottom: 24 };

  const sectionTitleStyle: React.CSSProperties = isDesktop
    ? { fontSize: 20, fontWeight: 600, marginBottom: 12 }
    : { fontSize: 17, fontWeight: 600, marginBottom: 8 };

  const itemStyle: React.CSSProperties = isDesktop
    ? { marginBottom: 16, padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }
    : { marginBottom: 12, padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" };

  const questionStyle: React.CSSProperties = isDesktop
    ? { fontWeight: 600, marginBottom: 4 }
    : { fontWeight: 600, marginBottom: 2, fontSize: 14 };

  const answerStyle: React.CSSProperties = isDesktop
    ? { color: "#555", lineHeight: 1.5 }
    : { color: "#555", fontSize: 13, lineHeight: 1.4 };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>{t("support.title")}</h1>
      {sections.map((section) => (
        <div key={section.title} style={sectionStyle}>
          <h2 style={sectionTitleStyle}>{section.title}</h2>
          {section.items.map((item) => (
            <div key={item.q} style={itemStyle}>
              <p style={questionStyle}>{item.q}</p>
              <p style={answerStyle}>{item.a}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
