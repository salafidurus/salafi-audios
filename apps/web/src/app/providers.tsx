"use client";

import { ProvidersWeb } from "@sd/shared";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  apiBaseUrl?: string;
};

export function Providers({ children, apiBaseUrl }: Props) {
  return <ProvidersWeb apiBaseUrl={apiBaseUrl}>{children}</ProvidersWeb>;
}
