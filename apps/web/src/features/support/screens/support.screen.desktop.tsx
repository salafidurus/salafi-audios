"use client";

const SUPPORT_SECTIONS = [
  {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "What is Salafi Durus?",
        a: "Salafi Durus is a platform for authentic Islamic audio lectures from trusted scholars following the Salafi methodology.",
      },
      {
        q: "How do I save lectures for later?",
        a: "Tap the bookmark icon on any lecture to add it to your Library. You can access saved lectures from the Library tab.",
      },
      {
        q: "Can I listen offline?",
        a: "Yes — download lectures using the download button on the lecture detail screen. Downloaded lectures are available without an internet connection.",
      },
      {
        q: "How do I follow a scholar?",
        a: "Visit a scholar's profile and tap Follow. New lectures from followed scholars appear in your Feed.",
      },
    ],
  },
  {
    title: "Contact Us",
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

export function SupportDesktopWebScreen() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Support</h1>
      {SUPPORT_SECTIONS.map((section) => (
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
