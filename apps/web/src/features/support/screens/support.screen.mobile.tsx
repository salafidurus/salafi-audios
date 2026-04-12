"use client";

import { useTranslation } from "@/core/i18n/use-translation";

export function SupportMobileScreen() {
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
    <div style={{ padding: "16px 12px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t("support.title")}</h1>
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{section.title}</h2>
          {section.items.map((item) => (
            <div
              key={item.q}
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>{item.q}</p>
              <p style={{ color: "#555", fontSize: 13, lineHeight: 1.4 }}>{item.a}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
