/** Documents this module's responsibility and public boundary. */
"use client";

import { initApiClient, setLocaleProvider, setUnauthorizedHandler } from "@sd/core-api";
import { LocaleSchema, createQueryClient, queryKeys, type Locale } from "@sd/core-contracts";
import { localeToDir } from "@sd/core-i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { authClient } from "@/core/auth/auth-client";
import { useAuth } from "@/core/auth/use-auth";
import { ToastContainer } from "@/core/toast";
import { hasDocument, hasWindow } from "@/shared/lib/runtime-guards";

import { initProgressPersistence } from "./audio/progress-persistence";
import { createI18n } from "./i18n/i18n";

// Initialize the API client at module load time to prevent race conditions during hydration/mount
if (process.env.NEXT_PUBLIC_API_URL) {
  initApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });
}

setLocaleProvider(() => {
  if (hasDocument()) {
    return document.documentElement.lang;
  }
  return "en";
});

const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
  initialLocale: Locale;
};

export function Providers({ children, apiBaseUrl, initialLocale }: Props) {
  const [i18n] = useState(() => createI18n(initialLocale));
  const { isAuthenticated, user } = useAuth();

  // Synchronously configure API client on first render if a custom apiBaseUrl is provided (e.g. in tests/Storybook)
  useState(() => {
    if (apiBaseUrl) {
      initApiClient({ baseUrl: apiBaseUrl });
    }
  });

  // httpClient requires the API client to be configured (done at module load above).
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    return initProgressPersistence(user.id, {
      onFlushed: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.myLibrary.all });
      },
    });
  }, [isAuthenticated, user?.id]);

  // Sync i18n with cookie after hydration. The root layout is static so it
  // always passes "en" as the default. The inline script in layout.tsx sets
  // lang/dir before paint, but the i18n instance needs a post-hydration sync.
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    const locale = LocaleSchema.safeParse(match?.[1] ?? "en").data ?? "en";
    if (locale !== i18n.language) {
      i18n.changeLanguage(locale);
    }
  }, [i18n]);

  // Re-apply lang/dir on every language change, not just on mount. Without
  // this, switching locale via LanguageSwitch leaves `dir` stale until a
  // hard reload, since router.refresh() doesn't re-run the layout script.
  useEffect(() => {
    const applyDirection = (lng: string) => {
      const locale = LocaleSchema.safeParse(lng).data ?? "en";
      document.documentElement.lang = locale;
      document.documentElement.dir = localeToDir(locale);
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
          if (hasWindow() && window.location && !window.location.pathname.startsWith("/sign-in")) {
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
