"use client";

import type { CSSProperties } from "react";

type Provider = "apple" | "google";

export type AuthProviderButtonWebProps = {
  provider: Provider;
  onClick?: () => void;
  disabled?: boolean;
};

const providerConfig = {
  apple: {
    label: "Continue with Apple",
    src: "/auth/apple-logo-dark-1x.png",
    srcSet: "/auth/apple-logo-dark-1x.png 1x, /auth/apple-logo-dark-3x.png 3x",
    width: 24,
    height: 28,
    buttonStyle: {
      background: "#000000",
      color: "#FFFFFF",
      border: "none",
      fontWeight: 500,
    } satisfies CSSProperties,
  },
  google: {
    label: "Continue with Google",
    src: "/auth/google-logo-light-1x.png",
    srcSet: "/auth/google-logo-light-1x.png 1x, /auth/google-logo-light-4x.png 4x",
    width: 24,
    height: 24,
    buttonStyle: {
      background: "#FFFFFF",
      color: "#1F1F1F",
      border: "1px solid #747775",
      fontFamily: "Roboto, sans-serif",
      fontWeight: 500,
    } satisfies CSSProperties,
  },
} as const;

export function AuthProviderButtonWeb({
  provider,
  onClick,
  disabled = false,
}: AuthProviderButtonWebProps) {
  const config = providerConfig[provider];

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...baseButtonStyle,
        ...config.buttonStyle,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <img
        src={config.src}
        srcSet={config.srcSet}
        width={config.width}
        height={config.height}
        alt=""
        aria-hidden
        style={providerIconStyle}
      />
      {config.label}
    </button>
  );
}

const baseButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  fontSize: 16,
};

const providerIconStyle: CSSProperties = {
  display: "block",
  flexShrink: 0,
  objectFit: "contain",
};
