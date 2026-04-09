"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { initApiClient } from "@sd/core-api";
import { createQueryClient } from "@sd/core-contracts/query";
import type { Locale } from "@sd/core-i18n";
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
  }, [apiBaseUrl]);

  useEffect(() => {
    setLocaleCookie(initialLocale);
  }, [initialLocale]);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </I18nextProvider>
  );
}
