"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { hasWindow } from "@/shared/lib/runtime-guards";

const COOKIE_CONSENT_KEY = "cookie-consent:v1";
const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

function getCookieConsentFromStorage(): boolean {
  if (!hasWindow()) return false;
  const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return stored === "true";
}

function setCookieConsentInStorage(): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT));
}

export const accept = () => {
  setCookieConsentInStorage();
};

function subscribeToCookieConsent(onChange: () => void): () => void {
  if (!hasWindow()) return () => {};
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange);
  };
}

export function useCookieConsent() {
  const [isResolved, setIsResolved] = useState(false);
  const hasAccepted = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsentFromStorage,
    () => false,
  );

  useEffect(() => setIsResolved(true), []);

  return {
    hasAccepted,
    isResolved,
    accept,
  };
}
