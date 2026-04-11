"use client";

import { useTranslation } from "@sd/core-i18n";

export function SupportDesktopScreen() {
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

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>{t("support.title")}</h1>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{section.title}</h2>
          {section.items.map((item) => (
            <div
              key={item.q}
              style={{
                marginBottom: 16,
                padding: 16,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: 4 }}>{item.q}</p>
              <p style={{ color: "#555", lineHeight: 1.5 }}>{item.a}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
