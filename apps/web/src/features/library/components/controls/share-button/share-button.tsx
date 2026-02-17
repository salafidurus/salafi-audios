"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./share-button.module.css";

type ShareButtonProps = {
  url: string;
  title: string;
  label?: string;
  className?: string;
};

const COPIED_RESET_MS = 2000;

export function ShareButton({ url, title, label = "Share", className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current != null) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, []);

  async function handleClick() {
    if (typeof navigator === "undefined") return;
    if (resetTimeoutRef.current != null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    const fullUrl = url.startsWith("/") ? `${window.location.origin}${url}` : url;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url: fullUrl,
        });
      } else {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        resetTimeoutRef.current = setTimeout(() => {
          resetTimeoutRef.current = null;
          setCopied(false);
        }, COPIED_RESET_MS);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        resetTimeoutRef.current = setTimeout(() => {
          resetTimeoutRef.current = null;
          setCopied(false);
        }, COPIED_RESET_MS);
      } catch {
        // ignore
      }
    }
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${className ?? ""}`.trim()}
      onClick={handleClick}
      aria-label={label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
