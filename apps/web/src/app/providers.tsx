"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { initApiClient } from "@/core/api/client";
import { queryClient } from "@/core/api/query-client";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  initApiClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
