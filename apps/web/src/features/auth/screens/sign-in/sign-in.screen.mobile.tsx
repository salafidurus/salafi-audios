"use client";

import Image from "next/image";
import { useTranslation } from "@/core/i18n/use-translation";
import { AuthProviderButton } from "@/features/auth/components/provider-button";

export type SignInScreenProps = {
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
};

export function SignInMobileScreen({ onSignInWithGoogle, onSignInWithApple }: SignInScreenProps) {
  const { t } = useTranslation();

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            <Image
              src="/logo/logo_72.png"
              alt="Salafi Durus Logo"
              width={72}
              height={72}
              priority
            />
          </div>
          <h1 style={titleStyle}>Salafi Durus</h1>
          <p style={taglineStyle}>{t("auth.signIn.tagline", "Join the community of learners")}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <AuthProviderButton provider="apple" onClick={onSignInWithApple} />
          <AuthProviderButton provider="google" onClick={onSignInWithGoogle} />
        </div>
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

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: 8,
};

const logoContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "4.5rem",
  height: "4.5rem",
  marginBottom: 16,
};

const titleStyle: React.CSSProperties = {
  fontSize: "var(--typo-title-md-font-size)",
  fontWeight: "var(--typo-title-md-font-weight)" as React.CSSProperties["fontWeight"],
  fontFamily: "var(--typo-title-md-font-family)",
  textAlign: "center",
  margin: 0,
  color: "var(--content-primary)",
};

const taglineStyle: React.CSSProperties = {
  margin: "4px 0 0",
  color: "var(--content-muted)",
  fontFamily: "var(--typo-body-sm-font-family), sans-serif",
  fontSize: "var(--typo-body-sm-font-size)",
  lineHeight: "var(--typo-body-sm-line-height)",
  textAlign: "center",
};
