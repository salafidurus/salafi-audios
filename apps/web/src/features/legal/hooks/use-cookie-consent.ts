/** Documents this module's responsibility and public boundary. */
"use client";

import { useSyncExternalStore } from "react";

import { hasWindow } from "@/shared/lib/runtime-guards";

const COOKIE_CONSENT_KEY = "cookie-consent:v1";
const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

function getCookieConsentFromStorage(): boolean | null {
  if (!hasWindow()) return null;
  const stored = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  return stored === "true";
}

function setCookieConsentInStorage(): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT));
}

function clearCookieConsentInStorage(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT));
}

/** Persists cookie consent and notifies active consent consumers in this tab. */
export const accept = () => {
  setCookieConsentInStorage();
};

/** Withdraws optional tracking consent and notifies active consent consumers. */
export const withdraw = () => {
  clearCookieConsentInStorage();
};

function subscribeToCookieConsent(onChange: () => void): () => void {
  if (!hasWindow()) return () => {};
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange);
  };
}

/** Subscribes to cookie consent storage and exposes resolved state plus acceptance. */
export function useCookieConsent() {
  const consent = useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsentFromStorage,
    () => null,
  );

  return {
    hasAccepted: consent === true,
    isResolved: consent !== null,
    accept,
    withdraw,
  };
}
