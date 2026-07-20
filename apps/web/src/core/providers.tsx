"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initApiClient, setLocaleProvider, setUnauthorizedHandler } from "@sd/core-api";
import { createQueryClient } from "@sd/core-contracts/query";
import type { Locale } from "@sd/core-contracts";
import { authClient } from "@/core/auth/auth-client";
import { ToastContainer } from "@/core/toast";
import { createI18n } from "./i18n/i18n";

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
    setLocaleProvider(() => i18n.language);
  }, [apiBaseUrl, i18n]);

  // Sync i18n with cookie after hydration. The root layout is static so it
  // always passes "en" as the default. The inline script in layout.tsx sets
  // lang/dir before paint, but the i18n instance needs a post-hydration sync.
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    const locale = (match?.[1] ?? "en") as Locale;
    if (locale !== i18n.language) {
      i18n.changeLanguage(locale);
    }
  }, [i18n]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authClient.signOut().then(() => {
        window.location.href = "/sign-in";
      });
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
