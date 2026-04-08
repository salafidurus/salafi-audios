"use client";

export function PrivacyMobileWebScreen() {
  return (
    <div style={{ padding: "16px 12px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Privacy Policy</h1>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Information We Collect</h2>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.5 }}>
          We collect information you provide when creating an account and usage data such as
          listening history. We do not sell your personal information.
        </p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
          How We Use Your Information
        </h2>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.5 }}>
          Your information is used to provide the service, personalize your experience, and
          communicate important updates.
        </p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
          Data Storage &amp; Security
        </h2>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.5 }}>
          Your data is stored securely with industry-standard encryption. We retain your data only
          while your account is active.
        </p>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Contact</h2>
        <p style={{ color: "#555", fontSize: 14, lineHeight: 1.5 }}>privacy@salafidurus.com</p>
      </section>
    </div>
  );
}
