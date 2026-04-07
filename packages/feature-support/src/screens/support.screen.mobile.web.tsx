"use client";

const SUPPORT_SECTIONS = [
  {
    title: "FAQ",
    items: [
      {
        q: "What is Salafi Durus?",
        a: "A platform for authentic Islamic audio lectures from trusted scholars following the Salafi methodology.",
      },
      {
        q: "How do I save lectures?",
        a: "Tap the bookmark icon on any lecture to add it to your Library.",
      },
      {
        q: "Can I listen offline?",
        a: "Yes — download lectures using the download button. They'll be available without internet.",
      },
      {
        q: "How do I follow a scholar?",
        a: "Visit a scholar's profile and tap Follow.",
      },
    ],
  },
  {
    title: "Contact",
    items: [
      {
        q: "Email",
        a: "support@salafidurus.com",
      },
      {
        q: "Response time",
        a: "We aim to respond within 48 hours.",
      },
    ],
  },
];

export function SupportMobileWebScreen() {
  return (
    <div style={{ padding: "16px 12px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Support</h1>
      {SUPPORT_SECTIONS.map((section) => (
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
