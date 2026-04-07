"use client";

export function TermsOfUseDesktopWebScreen() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Terms of Use</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Acceptance of Terms</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          By accessing or using Salafi Durus, you agree to be bound by these Terms of Use. If you do
          not agree, do not use the service.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Use of the Service</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Salafi Durus provides access to Islamic audio lectures for personal, non-commercial use.
          You may not redistribute, modify, or commercially exploit the content without explicit
          permission from the content owners.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>User Accounts</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activities under your account. Notify us immediately of any unauthorized use.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Content &amp; Intellectual Property
        </h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          All audio content is provided by scholars and remains their intellectual property. The
          platform design, code, and branding are owned by Salafi Durus.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Termination</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          We may suspend or terminate your account if you violate these terms. You may delete your
          account at any time from your account settings.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Contact</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          For questions about these terms, contact legal@salafidurus.com.
        </p>
      </section>
    </div>
  );
}
