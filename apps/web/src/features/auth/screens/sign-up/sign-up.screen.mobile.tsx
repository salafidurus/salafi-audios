"use client";

import { useState } from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import { AuthProviderButton } from "@/features/auth/components/provider-button";

export type SignUpScreenProps = {
  onSignUpWithGoogle: () => void;
  onSignUpWithApple: () => void;
  onNavigateToSignIn: () => void;
};

export function SignUpMobileScreen({
  onSignUpWithGoogle,
  onSignUpWithApple,
  onNavigateToSignIn,
}: SignUpScreenProps) {
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>{t("auth.signUp.title")}</h1>

        <label style={termsRowStyle}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            style={checkboxStyle}
          />
          <span style={termsTextStyle}>
            {t("auth.signUp.iAgreeTo")}{" "}
            <span style={termsLinkStyle}>{t("common.termsOfService")}</span> {t("common.and")}{" "}
            <span style={termsLinkStyle}>{t("common.privacyPolicy")}</span>
          </span>
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AuthProviderButton
            provider="apple"
            onClick={termsAccepted ? onSignUpWithApple : undefined}
            disabled={!termsAccepted}
          />
          <AuthProviderButton
            provider="google"
            onClick={termsAccepted ? onSignUpWithGoogle : undefined}
            disabled={!termsAccepted}
          />
        </div>

        <button type="button" onClick={onNavigateToSignIn} style={linkBtnStyle}>
          {t("auth.signUp.alreadyAccount")}
        </button>
      </div>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  display: "flex",
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 16px",
  minHeight: "100%",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  width: "100%",
  maxWidth: 360,
  padding: 20,
  borderRadius: 24,
  background: "var(--accent-mixed-surface, var(--surface-default))",
  border: "1px solid var(--accent-mixed-border, var(--border-default))",
  boxShadow: "var(--shadow-md)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "var(--typo-title-md-font-size)",
  fontWeight: "var(--typo-title-md-font-weight)" as React.CSSProperties["fontWeight"],
  fontFamily: "var(--typo-title-md-font-family)",
  textAlign: "center",
  margin: 0,
  color: "var(--content-primary)",
};

const linkBtnStyle: React.CSSProperties = {
  textAlign: "center",
  color: "var(--content-primary)",
  fontSize: 14,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

const termsRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  marginTop: 1,
  flexShrink: 0,
  accentColor: "var(--accent-primary-border, var(--action-primary))",
  cursor: "pointer",
};

const termsTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--content-default)",
  lineHeight: "1.4",
};

const termsLinkStyle: React.CSSProperties = {
  color: "var(--content-primary)",
};
