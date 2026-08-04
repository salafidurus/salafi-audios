"use client";

import type { Locale } from "@sd/core-contracts";

import { initApiClient, setLocaleProvider, setUnauthorizedHandler } from "@sd/core-api";
import { createQueryClient, queryKeys } from "@sd/core-contracts";
import { localeToDir } from "@sd/core-i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { authClient } from "@/core/auth/auth-client";
import { useAuth } from "@/core/auth/use-auth";
import { ToastContainer } from "@/core/toast";

import { initProgressPersistence } from "./audio/progress-persistence";
import { createI18n } from "./i18n/i18n";

const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
  initialLocale: Locale;
};

export function Providers({ children, apiBaseUrl, initialLocale }: Props) {
  const [i18n] = useState(() => createI18n(initialLocale));
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    initApiClient(apiBaseUrl ? { baseUrl: apiBaseUrl } : undefined);
    setLocaleProvider(() => i18n.language);
  }, [apiBaseUrl, i18n]);

  // Must run after the initApiClient effect above — httpClient throws until
  // configureApiClient() has been called, and effects fire in declaration order.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    return initProgressPersistence(user.id, {
      onFlushed: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
      },
    });
  }, [isAuthenticated, user?.id]);

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
      // Only redirect to sign-in if the user was authenticated (session expired
      // mid-flight). For anonymous users hitting unauthenticated public API
      // calls, a 401 is expected and should NOT trigger a redirect.
      if (isAuthenticated) {
        authClient.signOut().then(() => {
          queryClient.clear();
          if (
            typeof window !== "undefined" &&
            window.location &&
            !window.location.pathname.startsWith("/sign-in")
          ) {
            window.location.href = "/sign-in";
          }
        });
      } else {
        queryClient.clear();
      }
    });
  }, [isAuthenticated]);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
