"use client";

import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { initApiClient } from "@sd/ui-mobile";
import { createQueryClient } from "@sd/contracts";

type Props = {
  children: ReactNode;
};

const queryClient = createQueryClient();

export function Providers({ children }: Props) {
  useEffect(() => {
    // Initialize API client once on mount — pass env var directly so Next.js inlines it
    initApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "" });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
