"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initApiClient, setLocaleProvider, setUnauthorizedHandler } from "@sd/core-api";
import { createQueryClient, shouldPersistQuery, DEFAULT_MAX_AGE } from "@sd/core-contracts";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { Locale } from "@sd/core-contracts";
import { authClient } from "@/core/auth/auth-client";
import { ToastContainer } from "@/core/toast";
import { createI18n } from "./i18n/i18n";
import { setLocaleCookie } from "./i18n/locale-cookie";
import { createIdbPersister } from "./persister";

const queryClient = createQueryClient();
const persister = createIdbPersister();

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

  useEffect(() => {
    setLocaleCookie(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authClient.signOut().then(async () => {
        queryClient.clear();
        await persister.removeClient();
        window.location.href = "/sign-in";
      });
    });
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: DEFAULT_MAX_AGE,
          dehydrateOptions: {
            shouldDehydrateQuery: (query: any) => shouldPersistQuery(query.queryKey),
          },
        }}
      >
        {children}
        <ToastContainer />
      </PersistQueryClientProvider>
    </I18nextProvider>
  );
}
