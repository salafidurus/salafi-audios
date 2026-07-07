"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./provider-button.module.css";

type ThemeMode = "light" | "dark";

export type GoogleButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export type AppleButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

function GoogleSvg() {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden
      style={{ display: "block" }}
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

function AppleSvg() {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ display: "block", fill: "currentColor" }}
    >
      <path d="M17.05 13.5c-.91 2.18-2.87 3.76-5.3 3.76-2.44 0-4.39-1.58-5.3-3.76H0v3.12c0 3.08 2.45 5.63 5.63 5.63h12.74c3.18 0 5.63-2.55 5.63-5.63v-3.12h-6.95zm2.5-6.62c1.5 0 2.75-1.25 2.75-2.75S20.55 1.38 19.05 1.38 16.3 2.63 16.3 4.13s1.25 2.75 2.75 2.75zM4.13 5.38C2.63 5.38 1.38 4.13 1.38 2.63S2.63 0 4.13 0s2.75 1.25 2.75 2.75-1.25 2.63-2.75 2.63z" />
    </svg>
  );
}

function useThemeMode(): ThemeMode {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const readTheme = (): ThemeMode =>
      root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const syncTheme = () => setThemeMode(readTheme());
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return themeMode;
}

export function GoogleButton({ onClick, disabled = false }: GoogleButtonProps) {
  const themeMode = useThemeMode();
  const isDark = themeMode === "dark";

  return (
    <button
      type="button"
      className={styles.gsiMaterialButton}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label="Continue with Google"
      style={
        {
          "--gsi-bg-color": isDark ? "#131314" : "#fff",
          "--gsi-border-color": isDark ? "#8e918f" : "#747775",
          "--gsi-text-color": isDark ? "#e3e3e3" : "#1f1f1f",
          "--gsi-opacity": disabled ? "0.45" : "1",
        } as CSSProperties
      }
    >
      <div className={styles.gsiMaterialButtonState} />
      <div className={styles.gsiMaterialButtonContentWrapper}>
        <div className={styles.gsiMaterialButtonIcon}>
          <GoogleSvg />
        </div>
        <span className={styles.gsiMaterialButtonContents}>Sign in with Google</span>
        <span style={{ display: "none" }}>Sign in with Google</span>
      </div>
    </button>
  );
}

export function AppleButton({ onClick, disabled = false }: AppleButtonProps) {
  const themeMode = useThemeMode();
  const isDark = themeMode === "dark";

  return (
    <button
      type="button"
      className={styles.appleButton}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label="Continue with Apple"
      style={
        {
          "--apple-bg-color": isDark ? "#fff" : "#000",
          "--apple-text-color": isDark ? "#000" : "#fff",
        } as CSSProperties
      }
    >
      <div className={styles.appleButtonContentWrapper}>
        <div className={styles.appleButtonIcon}>
          <AppleSvg />
        </div>
        <span className={styles.appleButtonContents}>Sign in with Apple</span>
      </div>
    </button>
  );
}

/* Legacy export for backwards compatibility */
export type AuthProviderButtonProps = {
  provider: "apple" | "google";
  onClick?: () => void;
  disabled?: boolean;
};

export function AuthProviderButton({ provider, onClick, disabled }: AuthProviderButtonProps) {
  if (provider === "apple") {
    return <AppleButton onClick={onClick} disabled={disabled} />;
  }
  return <GoogleButton onClick={onClick} disabled={disabled} />;
}
