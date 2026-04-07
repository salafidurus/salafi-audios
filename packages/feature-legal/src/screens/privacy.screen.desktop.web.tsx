"use client";

export function PrivacyDesktopWebScreen() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Privacy Policy</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Information We Collect</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          We collect information you provide when creating an account (email, display name) and
          usage data such as listening history and saved lectures. We do not sell your personal
          information to third parties.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          How We Use Your Information
        </h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Your information is used to provide and improve the service, personalize your experience
          (e.g., resume playback, recommendations), and communicate important updates about the
          platform.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          Data Storage &amp; Security
        </h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Your data is stored securely using industry-standard encryption. Audio files are served
          via secure, time-limited URLs. We retain your data only as long as your account is active.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Contact</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          For privacy-related inquiries, contact us at privacy@salafidurus.com.
        </p>
      </section>
    </div>
  );
}
