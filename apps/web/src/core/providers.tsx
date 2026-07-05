"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import {
  initApiClient,
  setAccessTokenProvider,
  setLocaleProvider,
  setUnauthorizedHandler,
} from "@sd/core-api";
import { createQueryClient } from "@sd/core-contracts/query";
import type { Locale } from "@sd/core-contracts";
import { authClient } from "@/core/auth/auth-client";
import { clearBearerToken, getBearerToken } from "@/core/auth/bearer-token";
import { createI18n } from "./i18n/i18n";
import { setLocaleCookie } from "./i18n/locale-cookie";

const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
  initialLocale: Locale;
};

export function Providers({ children, apiBaseUrl, initialLocale }: Props) {
  const [i18n] = useState(() => createI18n(initialLocale));

  useEffect(() => {
    initApiClient(apiBaseUrl ? { baseUrl: apiBaseUrl } : undefined);
    setAccessTokenProvider(() => getBearerToken());
    // Send the active UI locale as Accept-Language so the API resolves
    // content translations to the user's selected language.
    setLocaleProvider(() => i18n.language);
  }, [apiBaseUrl, i18n]);

  useEffect(() => {
    setLocaleCookie(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearBearerToken();
      authClient.signOut().then(() => {
        window.location.href = "/sign-in";
      });
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  );
}
