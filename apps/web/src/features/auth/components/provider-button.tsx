"use client";

import { useEffect, useState, type CSSProperties } from "react";

type Provider = "apple" | "google";
type ThemeMode = "light" | "dark";

export type AuthProviderButtonWebProps = {
  provider: Provider;
  onClick?: () => void;
  disabled?: boolean;
};

const providerConfig = {
  apple: {
    label: "Continue with Apple",
    width: 200,
    height: 44,
  },
  google: {
    label: "Continue with Google",
    width: 191,
    height: 40,
  },
} as const;

export function AuthProviderButtonWeb({
  provider,
  onClick,
  disabled = false,
}: AuthProviderButtonWebProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const config = providerConfig[provider];
  const themeConfig = getProviderThemeConfig(provider, themeMode);

  useEffect(() => {
    const root = document.documentElement;
    const readTheme = (): ThemeMode =>
      root.getAttribute("data-theme") === "dark" ? "dark" : "light";

    const syncTheme = () => {
      setThemeMode(readTheme());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={config.label}
      style={{
        ...baseButtonStyle,
        ...themeConfig.buttonStyle,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <img
        src={themeConfig.src}
        srcSet={themeConfig.srcSet}
        width={config.width}
        height={config.height}
        alt=""
        aria-hidden
        style={providerImageStyle}
      />
    </button>
  );
}

const baseButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: "2.9rem",
  padding: 0,
  border: "none",
  background: "transparent",
  lineHeight: 0,
  overflow: "hidden",
};

const providerImageStyle: CSSProperties = {
  display: "block",
  width: "auto",
  maxWidth: "100%",
  height: "2.9rem",
  objectFit: "contain",
};

function getProviderThemeConfig(provider: Provider, themeMode: ThemeMode) {
  if (provider === "apple") {
    if (themeMode === "dark") {
      return {
        src: "/auth/apple-continue-dark-1x.png",
        srcSet: "/auth/apple-continue-dark-1x.png 1x, /auth/apple-continue-dark-4x.png 4x",
        buttonStyle: {} satisfies CSSProperties,
      };
    }

    return {
      src: "/auth/apple-continue-light-1x.png",
      srcSet: "/auth/apple-continue-light-1x.png 1x, /auth/apple-continue-light-4x.png 4x",
      buttonStyle: {} satisfies CSSProperties,
    };
  }

  if (themeMode === "dark") {
    return {
      src: "/auth/google-continue-dark-1x-web.png",
      srcSet: "/auth/google-continue-dark-1x-web.png 1x, /auth/google-continue-dark-4x-web.png 4x",
      buttonStyle: {} satisfies CSSProperties,
    };
  }

  return {
    src: "/auth/google-continue-light-1x-web.png",
    srcSet: "/auth/google-continue-light-1x-web.png 1x, /auth/google-continue-light-4x-web.png 4x",
    buttonStyle: {} satisfies CSSProperties,
  };
}
