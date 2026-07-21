"use client";

import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "cookie-consent:v1";
const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

export interface CookieConsentState {
  accepted: true;
}

function getCookieConsentFromStorage(): CookieConsentState | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (stored === "true") return { accepted: true };
  return null;
}

function setCookieConsentInStorage(state: CookieConsentState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT));
}

export const accept = () => {
  setCookieConsentInStorage({ accepted: true });
};

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConsent(getCookieConsentFromStorage());
    setMounted(true);

    const handleConsentChange = () => {
      setConsent(getCookieConsentFromStorage());
    };

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, handleConsentChange);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, handleConsentChange);
    };
  }, []);

  return {
    hasAccepted: mounted && consent !== null,
    accept,
  };
}
