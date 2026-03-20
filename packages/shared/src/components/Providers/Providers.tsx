"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { initApiClient } from "@sd/core-api";
import { createQueryClient } from "@sd/contracts/query";

const queryClient = createQueryClient();

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  useEffect(() => {
    initApiClient();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
