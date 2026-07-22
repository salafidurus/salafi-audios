"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initApiClient, setLocaleProvider, setUnauthorizedHandler } from "@sd/core-api";
import { createQueryClient, shouldPersistQuery, DEFAULT_MAX_AGE } from "@sd/core-contracts";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { Locale } from "@sd/core-contracts";
import { localeToDir } from "@sd/core-i18n";
import { authClient } from "@/core/auth/auth-client";
import { ToastContainer } from "@/core/toast";
import { createI18n } from "./i18n/i18n";
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

  // Re-apply lang/dir on every language change, not just on mount. Without
  // this, switching locale via LanguageSwitch leaves `dir` stale until a
  // hard reload, since router.refresh() doesn't re-run the layout script.
  useEffect(() => {
    const applyDirection = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = localeToDir(lng as Locale);
    };
    applyDirection(i18n.language);
    i18n.on("languageChanged", applyDirection);
    return () => {
      i18n.off("languageChanged", applyDirection);
    };
  }, [i18n]);

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
            shouldDehydrateQuery: (query: any) =>
              query.state.status === "success" && shouldPersistQuery(query.queryKey),
          },
        }}
      >
        {children}
        <ToastContainer />
      </PersistQueryClientProvider>
    </I18nextProvider>
  );
}
