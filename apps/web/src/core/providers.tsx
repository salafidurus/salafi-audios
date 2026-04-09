"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { initApiClient } from "@sd/core-api";
import { createQueryClient } from "@sd/core-contracts/query";

const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
};

export function Providers({ children, apiBaseUrl }: Props) {
  useEffect(() => {
    initApiClient(apiBaseUrl ? { baseUrl: apiBaseUrl } : undefined);
  }, [apiBaseUrl]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
